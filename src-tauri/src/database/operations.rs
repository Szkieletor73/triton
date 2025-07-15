use std::path::PathBuf;

use serde_json::{Map, Value};
use sqlx::{Column, Error, Row, SqlitePool, TypeInfo};

use super::entities::item::Item;

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
        query.push_str(" WHERE");
    }

    sqlx::query_scalar::<_, i64>(&query).fetch_all(pool).await
}

pub async fn get_item_details(
    pool: &SqlitePool,
    ids: &Vec<i64>
) -> Result<Vec<Item>, Error> {
    if ids.is_empty() {
        return Err(Error::RowNotFound)
    }

    let query = String::from(
        format!(
            "SELECT * FROM items WHERE id IN ({})",
            ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(", ")
        )
    );

    sqlx::query_as::<_, Item>(&query).fetch_all(pool).await
}

pub async fn add_items(
    pool: &SqlitePool,
    file_paths: &Vec<PathBuf>
) -> Result<(Vec<i64>, Vec<String>), Error> {
    if file_paths.is_empty() {
        return Ok((Vec::new(), Vec::new()))
    }

    // Collect all paths as strings
    let paths: Vec<String> = file_paths.iter()
        .map(|p| p.display().to_string())
        .collect();

    // Query for existing paths
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
    let existing_paths: Vec<String> = q.fetch_all(pool).await?;

    // Start query string (we'll append to it later)
    let mut query = String::from("INSERT OR IGNORE INTO items (path, title, extension) VALUES");
    let mut any_valid = false;
    for path in file_paths {
        if path.as_os_str().is_empty() {
            continue;
        }
        let extension = path.extension().and_then(|os_str| os_str.to_str()).unwrap_or("");
        let filename = path.file_stem().and_then(|os_str| os_str.to_str()).unwrap_or("");

        let abs_path = path.display().to_string();

        let item = (
            abs_path.as_str(),
            filename,
            extension
        );

        query.push_str(
            &format!(
            " (\"{}\", \"{}\", \"{}\"),",
            item.0, item.1, item.2
        ));
        
        any_valid = true;
    }

    if query.ends_with(",") {
        query.pop();
    }

    query.push_str(" RETURNING id");

    let inserted_ids = if any_valid {
        sqlx::query_scalar::<_, i64>(&query).fetch_all(pool).await?
    } else {
        Vec::new()
    };

    Ok((inserted_ids, existing_paths))
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