# Function Workflow

# Context дотор

1. **SQLite Table үүсгэх**
2. **Интернэт холболт байгаа эсэхийг шалгах**

# Интернэт холболт байгаа бол (isConnected == true):

├─ 2.1. `getReferencesService()` - Reference датаг авах.
│ ├─ 2.1.1 `saveReferencesWithClear()`
│ │ ├─ 2.1.1.1 `clearReferencesTables()` - Хуучин өгөгдлүүдийг цэвэрлэх.
│ │ │ └─ 2.1.1.1.1 `insertReferencesData()` - Шинэ өгөгдөл оруулах.
│ ├─ 2.1.2 `fetchReferencesData()` - Өгөгдлүүдийг ачаалах.
│ └─ 2.1.3 `checkUserData()`

# Интернэт холболт байхгүй бол (isConnected == false):

├─3.1. `fetchReferencesData()` - Өгөгдлийг локал BASE -д хадгалсан өгөгдлөөс ачаалах.
│ └─ 2.1.3 `checkUserData()`

#
