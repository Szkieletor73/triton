use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub id: i64,

    pub path: String,

    pub extension: String,

    pub title: String,

    pub description: Option<String>,

    pub thumbnail: Option<String>,

    #[serde(with = "chrono::serde::ts_seconds")]
    pub added: chrono::DateTime<chrono::Utc>,

    #[serde(with = "chrono::serde::ts_seconds")]
    pub last_verified: chrono::DateTime<chrono::Utc>,
}