mod commands;
mod database;
// mod video;

use std::path::PathBuf;

use tauri::Manager;
use once_cell::sync::OnceCell;

static APP_DATA_DIR: OnceCell<PathBuf> = OnceCell::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get App Data Dir");

            APP_DATA_DIR.set(app_data_dir)
                .expect("Failed to set APP_DATA_DIR global (already initialized?)");

            let db_path = APP_DATA_DIR.get()
                .expect("Failed to get global APP_DATA_DIR")
                .join("database.db");

            let pool = tokio::runtime::Runtime::new()
                .unwrap()
                .block_on(database::init_db(db_path.to_str().unwrap()))?;

            app.manage(pool);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                commands::raw_sql,
                commands::add_items,
                commands::delete_items,
                commands::get_items,
                commands::get_item_details,
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
