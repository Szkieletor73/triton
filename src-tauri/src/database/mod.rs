pub mod entities;
pub mod operations;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::path::Path;

pub type DbPool = SqlitePool;

pub async fn init_db(path: &str) -> Result<DbPool, sqlx::Error> {
    let db_path = Path::new(path);

    if let Some(parent) = db_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    let pool = SqlitePool::connect_with(
        SqliteConnectOptions::new()
            .filename(db_path)
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal),
    )
    .await?;

    sqlx::migrate!("src/database/migrations").run(&pool).await?;

    Ok(pool)
}
