use serde::Serialize;
use std::path::PathBuf;

use crate::database::{self, entities::item::Item};
use tauri::State;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct AddItemsResult {
    success: Vec<i64>,
    duplicates: Vec<String>,
    errors: Vec<AddItemError>,
}

#[derive(Serialize)]
pub struct AddItemError {
    path: String,
    error: String,
}

#[tauri::command]
pub async fn add_items(
    app: tauri::AppHandle,
    pool: State<'_, database::DbPool>,
) -> Result<AddItemsResult, String> {
    let pool = pool.inner().clone();
    let tokio_handle = tokio::runtime::Handle::current();

    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

    app.dialog().file().pick_files(move |file_paths| {
        let tx = tx.clone();
        let pool = pool.clone();
        let tokio_handle = tokio_handle.clone();

        tokio_handle.spawn(async move {
            let result = match file_paths {
                Some(paths) => {
                    let files: Vec<PathBuf> = paths
                        .into_iter()
                        .filter_map(|fp| fp.into_path().ok())
                        .collect();

                    match database::operations::add_items(&pool, &files).await {
                        Ok(db_result) => Ok(AddItemsResult {
                            success: db_result.success,
                            duplicates: db_result.duplicates,
                            errors: db_result
                                .errors
                                .into_iter()
                                .map(|e| AddItemError {
                                    path: e.path,
                                    error: e.error,
                                })
                                .collect(),
                        }),
                        Err(e) => Err(e.to_string()),
                    }
                }
                None => Ok(AddItemsResult {
                    success: Vec::new(),
                    duplicates: Vec::new(),
                    errors: Vec::new(),
                }),
            };

            let _ = tx.send(result);
        });
    });

    rx.recv()
        .await
        .unwrap_or_else(|| Err("Operation cancelled or failed".to_string()))
}

#[tauri::command]
pub async fn delete_items(
    pool: State<'_, database::DbPool>,
    ids: Vec<i64>,
) -> Result<Vec<i64>, String> {
    database::operations::delete_items(&pool, &ids)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_items(
    pool: State<'_, database::DbPool>,
    search: String,
) -> Result<Vec<i64>, String> {
    database::operations::get_items(&pool, &search)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_item_details(
    pool: State<'_, database::DbPool>,
    ids: Vec<i64>,
) -> Result<Vec<Item>, String> {
    database::operations::get_item_details(&pool, &ids)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn raw_sql(
    pool: State<'_, database::DbPool>,
    query: String,
) -> Result<Vec<serde_json::Value>, String> {
    database::operations::execute_raw_sql(&pool, query)
        .await
        .map(|maps| maps.into_iter().map(serde_json::Value::Object).collect())
        .map_err(|e| e.to_string())
}
