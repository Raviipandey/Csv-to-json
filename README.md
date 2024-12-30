# CSV to JSON Converter API 🚀

A robust API service that transforms CSV files into structured JSON data, handling nested properties and large datasets efficiently. Built with Node.js, Express, and TypeScript, this service provides seamless data processing and storage capabilities.

## Features ✨
- **CSV to JSON conversion** with nested property support.
- **Efficient streaming** for large file processing.
- **Batch processing optimization**.
- **PostgreSQL database integration**.
- **Production-ready deployment**.
- **RESTful API endpoints**.

## Tech Stack 💻
- **Node.js**
- **Express.js**
- **TypeScript**
- **PostgreSQL**
- **Render** (Deployment)

---

## API Endpoints 🛠️

### Upload CSV
**POST** `/api/users/upload`

**Description:** Accepts CSV files and converts them into structured JSON data with support for nested properties.

#### Expected CSV Structure
```
name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state,gender
Rohit,Prasad,35,A-563 Rakshak Society,New Pune Road,Pune,Maharashtra,male
```

#### Example cURL Request
```bash
curl -X POST -F "csv=@your_file.csv" https://csv-to-json-69f9.onrender.com/api/users/upload
```

---

## Getting Started 🚀

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL**
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/csv-to-json-converter.git
```

2. **Install dependencies**
```bash
npm install
```

3. **Create a `.env` file**
```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
```

4. **Run the development server**
```bash
npm run dev
```

---

## Database Setup 📊

Execute the following SQL script to set up the required database:
```sql
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,                  
    name VARCHAR NOT NULL,                   
    age INT NOT NULL,                        
    address JSONB,                          
    additional_info JSONB                   
);
```

---

## License 📄
This project is licensed under the MIT License. Feel free to use and contribute!
