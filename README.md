# AGRISTOCK 🌱
### Smart Agricultural Inventory Management & AI-Based Nutrient Deficiency Detection

AGRISTOCK is a web-based agricultural management platform that combines fertilizer inventory management with AI-powered plant leaf analysis. It aims to help agricultural businesses manage their products and operations while enabling farmers to identify potential nutrient deficiencies and receive fertilizer recommendations based on available inventory.

## Overview

AGRISTOCK brings agricultural inventory operations and AI-assisted crop analysis into a single platform.

The system combines a web application, a REST API, a relational database, and a machine learning service to support inventory management and plant nutrient deficiency analysis.

### Key Capabilities

- **Inventory Management:** Manage fertilizer products and related inventory information.
- **Farmer Management:** Support farmer accounts and associated records.
- **Sales & Purchases:** Track sales, purchases, and related transactions.
- **Expense Tracking:** Record and analyze business expenses.
- **Analytics Dashboard:** Present summaries of agricultural business operations.
- **AI-Based Leaf Analysis:** Analyze uploaded plant leaf images using a trained deep learning model.
- **Fertilizer Recommendations:** Support fertilizer recommendations using scan results and available product information.
- **Scan History:** Maintain and review plant analysis records.

## System Architecture

```text
                  AGRISTOCK
                      |
          +-----------+-----------+
          |                       |
     Web Frontend             REST API
      Next.js                Node.js
          |                       |
          |              +--------+--------+
          |              |                 |
          |          PostgreSQL       ML Service
          |                            FastAPI
          |                                |
          |                         Trained CNN Model
          |                                |
          +-----------+--------------------+
                      |
              User-Facing Results
```

The frontend communicates with the backend API. The backend manages application data and coordinates with the machine learning service for leaf analysis.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling & UI | Tailwind CSS, Lucide React |
| Data Visualization | Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT-based authentication, bcrypt |
| Machine Learning API | Python, FastAPI |
| Deep Learning | TensorFlow, Keras, MobileNetV2 preprocessing |
| Model Format | Keras `.keras` |
| Version Control | Git, GitHub |

## Project Structure

```text
AGRISTOCK/
├── client/                 # Next.js frontend
│   ├── public/             # Static assets
│   └── src/
│       ├── app/            # Application pages and layouts
│       ├── components/     # Reusable UI components
│       ├── state/          # API integration and state management
│       └── types/          # TypeScript definitions
│
├── server/                 # Node.js backend
│   ├── prisma/
│   │   ├── migrations/     # Database migrations
│   │   └── schema.prisma   # Database schema
│   └── src/
│       ├── controllers/    # Request handling and business logic
│       ├── middleware/     # Authentication and upload middleware
│       ├── routes/         # API routes
│       └── utils/          # Shared utilities
│
├── ml-service/             # Machine learning service
│   ├── model/
│   │   ├── class_names.json
│   │   └── leaf_model_finetuned.keras
│   ├── main.py             # ML API entry point
│   └── train.py            # Model training script
│
├── .gitignore
├── README.md
└── project-structure.txt
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3.10 or another version supported by the project's ML dependencies
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AGRISTOCK
```

Replace the repository URL with your private GitHub repository URL. You must have permission to access a private repository.

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `server/.env` file and configure the variables required by the backend.

Example configuration:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_strong_random_secret"
PORT=3001
```

Use the exact environment variable names expected by the application. Add any additional variables required by your backend configuration.

Generate the Prisma client and apply the existing database migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Start the backend using the development script defined in `server/package.json`, for example:

```bash
npm run dev
```

### 3. Configure the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env.local` and configure the backend API URL using the environment variable name expected by the frontend.

For example, if the application uses `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Configure the Machine Learning Service

Open another terminal from the project root:

```bash
cd ml-service
```

Create and activate a Python virtual environment.

**Windows PowerShell:**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install the ML dependencies listed in the project's dependency file. If a `requirements.txt` is provided:

```powershell
pip install -r requirements.txt
```

Configure the model path and other required settings according to `main.py`. The service expects the fine-tuned model at:

```text
ml-service/model/leaf_model_finetuned.keras
```

Start the service using the FastAPI application entry point defined in `main.py`. For example, if the FastAPI instance is named `app`:

```powershell
uvicorn main:app --reload --port 8000
```

The frontend, backend, database, and ML service must each be configured correctly for the complete application workflow to function.

## Machine Learning Workflow

The AI-assisted analysis workflow is designed around the following steps:

1. A farmer uploads a plant leaf image.
2. The application sends the image for analysis through the backend and ML service.
3. The trained deep learning model processes the image.
4. The service returns its prediction according to the model's supported classes.
5. The application uses the analysis result and available product information to support fertilizer recommendations.
6. Scan results can be reviewed through the application's supported history features.

**Important:** Model predictions are intended to support agricultural assessment. They should not replace professional agronomic advice or laboratory soil testing where appropriate.

## Database Management

AGRISTOCK uses PostgreSQL for persistent application data and Prisma for database schema management.

Useful Prisma commands:

```bash
# Generate the Prisma client
npx prisma generate

# Apply existing migrations
npx prisma migrate deploy

# Create and apply a development migration
npx prisma migrate dev
```

Run production migrations only after configuring the correct database and reviewing the migration files. Avoid destructive database reset commands on production data.

## Deployment

The project is being prepared for deployment using the following hosting approach:

| Component | Planned Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| ML API | Render or another compatible Python hosting service |
| PostgreSQL Database | Neon or another PostgreSQL provider |
| Image Storage | Cloudinary or another persistent object-storage service |

These are planned deployment targets, not a claim that the application is already live.

Production deployment requires the appropriate environment variables, database configuration, CORS settings, service URLs, and persistent image storage. Free hosting tiers may have resource limits, cold starts, or usage restrictions.

## Security & Configuration

- Keep `.env` files and all credentials out of version control.
- Use strong, unique secrets for production.
- Store passwords as secure hashes rather than plaintext.
- Configure production CORS rules to allow only trusted origins.
- Validate and restrict uploaded image files.
- Use persistent storage for files that must survive service restarts or redeployments.
- Protect private API routes with appropriate authentication and authorization.
- Do not commit real user data, database dumps, or sensitive training data.

## Current Scope

The repository contains the frontend, backend, database schema and migrations, and machine learning service components. The fine-tuned model and its class-label configuration are included in the project.

Training datasets and unnecessary model artifacts are excluded from version control to keep the repository focused on application deployment.

## Future Improvements

Potential areas for further development include:

- Model evaluation across additional crops and growing conditions.
- Improved recommendation accuracy using crop, growth stage, soil information, and nutrient requirements.
- More comprehensive model performance and confidence reporting.
- Enhanced mobile responsiveness and accessibility.
- Expanded analytics and reporting.
- Production monitoring, testing, and performance optimization.

## Contributing

Contributions and suggestions are welcome. For substantial changes, create a separate branch and submit a pull request with a clear explanation of the proposed improvement.

## Disclaimer

AGRISTOCK is an agricultural management and AI-assisted analysis project. Its predictions and recommendations depend on the available data, model performance, and application configuration. Users should verify important crop treatment decisions with qualified agricultural professionals.

## License

No license has been specified yet. Unless a license is added to this repository, permission to reuse, distribute, or modify this project should not be assumed.
