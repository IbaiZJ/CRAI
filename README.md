# CRAI - Car Registration Artificial Intelligence

[![ebAPI CI](https://github.com/IbaiZJ/CRAI/actions/workflows/ebAPI-ci.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/ebAPI-ci.yml)
[![itvAPI CI](https://github.com/IbaiZJ/CRAI/actions/workflows/itvAPI-ci.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/itvAPI-ci.yml)
[![AI CI](https://github.com/IbaiZJ/CRAI/actions/workflows/ai-ci.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/ai-ci.yml)
[![Frontend CI](https://github.com/IbaiZJ/CRAI/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/frontend-ci.yml)
[![OS CI](https://github.com/IbaiZJ/CRAI/actions/workflows/os-ci.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/os-ci.yml)
[![SonarCloud CI Analysis](https://github.com/IbaiZJ/CRAI/actions/workflows/sonarCloud.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/sonarCloud.yml)

## 📋 Project Description

**CRAI** (Car Registration Artificial Intelligence) is a comprehensive platform for processing and analyzing Spanish vehicle registration data (ITV - Inspección Técnica de Vehículos). The solution uses artificial intelligence and computer vision to extract, process, and manage license plate information and vehicle data.

### Key Features

- **Automatic License Plate Recognition (ANPR)**: Detection and reading of vehicle license plates using computer vision
- **Video Processing**: Real-time video stream analysis with frame extraction
- **Data Management**: MySQL database integrated with Google Cloud SQL
- **REST API**: Multiple endpoints for data queries and analysis
- **Modern Web Interface**: Interactive dashboard for data visualization
- **Workflow Orchestration**: Node-RED for process automation
- **Integrated Documentation**: Documentation site with Astro
- **Automated CI/CD**: Complete pipeline with GitHub Actions and SonarCloud

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (version 2.0+)
- **Node.js** 18+ and npm (if running services locally)
- **Python** 3.9+ (if running AI service locally)
- **Google Cloud SQL** with configured access

### Option 1: Complete Execution with Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/IbaiZJ/CRAI.git
   cd CRAI
   ```

2. **Set up environment variables**<br>
Ask to the administrator for all the environment variables.

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the services**
   | Service | URL | Description |
   |---------|-----|-------------|
   | frontend | http://localhost:6901 | Main dashboard |
   | as | http://localhost:6902 | AI API |
   | backend | http://localhost:6903 | Workflow orchestration |
   | ebAPI | http://localhost:6904 | Environmental Badge API |
   | itvAPI | http://localhost:6905 | ITV Date API |
   | os | http://localhost:6906 | Software simulation |
   | docs | http://localhost:6910 | Documentation |

## 📝 License

This project is under the license specified in `LICENSE`



