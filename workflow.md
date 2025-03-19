# Function Workflow

# Context дотор

1. **SQLite Table үүсгэх**
2. **Интернэт холболт байгаа эсэхийг шалгах**

# Интернэт холболт байгаа бол (isConnected == true):

├─ 2.1. `getReferencesService()` - Reference датаг авах.
│ ├─ 2.1.1 `saveReferencesWithClear()`
│ │ ├─ 2.1.1.1 `clearReferencesTables()` - Хуучин өгөгдлүүдийг цэвэрлэх.
│ │ │ └─ 2.1.1.1.1 `insertReferencesData()` - Шинэ өгөгдөл оруулах.
│ ├─ 2.1.2 `checkUserData()`
│ └─ 2.1.3 `fetchReferencesData()` - Өгөгдлүүдийг ачаалах.(Хамгийн сүүлд ажиллуулах ❗❗❗)

# Интернэт холболт байхгүй бол (isConnected == false):

├─3.1. `checkUserData()`
│ └─ 2.1.3 `fetchReferencesData()` - Өгөгдлийг локал BASE -д хадгалсан өгөгдлөөс ачаалах.(Хамгийн сүүлд ажиллуулах ❗❗❗)

#

# RELOAD

isConnected
-runFirst
-checkForUpdates
-createSQLTables
-checkUserData
-getReferencesService
-saveReferencesWithClear
-fetchReferencesData
-setRefsToState
-fetchLoginData
-setIsLoggedIn(true);

# LOGIN

-saveLoginDataWithClear
-fetchLoginData
-getReferencesService
-saveReferencesWithClear
-fetchReferencesData
-setRefsToState
-fetchLoginData
-setIsLoggedIn(true);
