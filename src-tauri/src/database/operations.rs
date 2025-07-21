use std::path::PathBuf;

use serde_json::{Map, Value};
use sqlx::{Column, Error, Row, SqlitePool, TypeInfo};

use super::entities::item::Item;

pub struct AddItemsResult {
    pub success: Vec<i64>,
    pub duplicates: Vec<String>,
    pub errors: Vec<AddItemError>,
}

pub struct AddItemError {
    pub path: String,
    pub error: String,
}

pub async fn execute_raw_sql(
    pool: &SqlitePool,
    query: String,
) -> Result<Vec<Map<String, Value>>, sqlx::Error> {
    // Basic protection against destructive commands (recommended even for local apps)
    let destructive_commands = ["DROP TABLE", "ALTER TABLE"];
    if destructive_commands
        .iter()
        .any(|cmd| query.to_uppercase().contains(cmd))
    {
        return Err(sqlx::Error::Configuration(
            "Destructive commands are not allowed".into(),
        ));
    }

    let mut results = Vec::new();
    let mut rows = sqlx::query(&query).fetch_all(pool).await?;

    // Handle different query types
    if query.trim_start().to_uppercase().starts_with("SELECT") {
        for row in rows.drain(..) {
            let mut map = Map::new();
            let columns = row.columns();

            for (idx, column) in columns.iter().enumerate() {
                let value: Value = match column.type_info().name() {
                    "TEXT" => row.get::<String, _>(idx).into(),
                    "INTEGER" => row.get::<i64, _>(idx).into(),
                    "REAL" => row.get::<f64, _>(idx).into(),
                    "BLOB" => row.get::<Vec<u8>, _>(idx).into(),
                    "DATETIME" => chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>(idx))
                        .map(|dt| dt.to_rfc3339())
                        .unwrap_or_default()
                        .into(),
                    _ => Value::Null,
                };
                map.insert(column.name().to_string(), value);
            }
            results.push(map);
        }
    } else {
        // For non-SELECT queries, return affected row count
        let mut result_map = Map::new();
        result_map.insert("affected_rows".to_string(), rows.len().into());
        results.push(result_map);
    }

    Ok(results)
}

pub async fn get_items(
    pool: &SqlitePool,
    search: &String
) -> Result<Vec<i64>, Error> {
    let mut query = String::from("SELECT id FROM items");

    if !search.is_empty() {
        // Add basic search functionality for title and path
        query.push_str(" WHERE title LIKE ? OR path LIKE ?");
        let search_pattern = format!("%{}%", search);
        return sqlx::query_scalar::<_, i64>(&query)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .fetch_all(pool)
            .await;
    }

    // Order by most recently added for better UX
    query.push_str(" ORDER BY added DESC");
    sqlx::query_scalar::<_, i64>(&query).fetch_all(pool).await
}

pub async fn get_item_details(
    pool: &SqlitePool,
    ids: &Vec<i64>
) -> Result<Vec<Item>, Error> {
    if ids.is_empty() {
        return Ok(Vec::new()) // Return empty vec instead of error
    }

    // For better performance with large batches, use parameter binding
    // Build placeholders for the IN clause
    let placeholders: Vec<String> = (0..ids.len()).map(|i| format!("?{}", i + 1)).collect();
    let query = format!(
        "SELECT * FROM items WHERE id IN ({}) ORDER BY id",
        placeholders.join(", ")
    );

    let mut query_builder = sqlx::query_as::<_, Item>(&query);
    
    // Bind all the IDs
    for id in ids {
        query_builder = query_builder.bind(id);
    }

    query_builder.fetch_all(pool).await
}

pub async fn add_items(
    pool: &SqlitePool,
    file_paths: &Vec<PathBuf>
) -> Result<AddItemsResult, Error> {
    if file_paths.is_empty() {
        return Ok(AddItemsResult {
            success: Vec::new(),
            duplicates: Vec::new(),
            errors: Vec::new(),
        })
    }

    let mut success_ids = Vec::new();
    let mut duplicates = Vec::new();
    let mut errors = Vec::new();

    // Collect all paths as strings
    let paths: Vec<String> = file_paths.iter()
        .map(|p| p.display().to_string())
        .collect();

    // Query for existing paths to identify duplicates
    if !paths.is_empty() {
        let mut query_existing = String::from("SELECT path FROM items WHERE path IN (");
        for (i, _) in paths.iter().enumerate() {
            if i > 0 {
                query_existing.push_str(", ");
            }
            query_existing.push_str(&format!("?{}", i + 1));
        }
        query_existing.push(')');

        let mut q = sqlx::query_scalar::<_, String>(&query_existing);
        for path in &paths {
            q = q.bind(path);
        }
        
        match q.fetch_all(pool).await {
            Ok(existing_paths) => duplicates = existing_paths,
            Err(e) => {
                // If we can't check for duplicates, treat it as an error for all paths
                for path in &paths {
                    errors.push(AddItemError {
                        path: path.clone(),
                        error: format!("Failed to check for duplicates: {}", e),
                    });
                }
                return Ok(AddItemsResult { success: success_ids, duplicates, errors });
            }
        }
    }

    // Process each file individually to handle errors per file
    for path in file_paths {
        let path_str = path.display().to_string();
        
        // Skip if it's a duplicate
        if duplicates.contains(&path_str) {
            continue;
        }

        // Validate path
        if path.as_os_str().is_empty() {
            errors.push(AddItemError {
                path: path_str,
                error: "Empty path".to_string(),
            });
            continue;
        }

        let extension = path.extension().and_then(|os_str| os_str.to_str()).unwrap_or("");
        let filename = path.file_stem().and_then(|os_str| os_str.to_str()).unwrap_or("");

        // Insert individual item
        let query = "INSERT INTO items (path, title, extension) VALUES (?, ?, ?) RETURNING id";
        
        match sqlx::query_scalar::<_, i64>(query)
            .bind(&path_str)
            .bind(filename)
            .bind(extension)
            .fetch_one(pool)
            .await 
        {
            Ok(id) => success_ids.push(id),
            Err(e) => {
                errors.push(AddItemError {
                    path: path_str,
                    error: e.to_string(),
                });
            }
        }
    }

    Ok(AddItemsResult {
        success: success_ids,
        duplicates,
        errors,
    })
}

pub async fn delete_items(
    pool: &SqlitePool,
    ids: &Vec<i64>
) -> Result<Vec<i64>, Error> {
    let query = String::from(
        format!(
            "DELETE FROM items WHERE id IN ({}) RETURNING id",
            ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(", ")
        )
    );

    sqlx::query_scalar::<_, i64>(&query).fetch_all(pool).await
}