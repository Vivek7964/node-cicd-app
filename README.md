# Node.js CI/CD Pipeline with Jenkins, SonarQube, Docker, Argo CD & Amazon EKS

A production-style **CI/CD and GitOps pipeline for a Node.js
application**, demonstrating automated testing, static code analysis,
containerization, Docker image publishing, Kubernetes manifest updates,
and continuous deployment to **Amazon EKS** using **Argo CD**.

The project is inspired by the Jenkins Zero To Hero CI/CD workflow and
adapted for a lightweight Node.js application.

------------------------------------------------------------------------

## 🚀 Project Overview

This project implements an end-to-end DevOps workflow:

``` text
Developer
    |
    | git push
    v
GitHub - Application Repository
    |
    | Webhook / SCM trigger
    v
Jenkins
    |
    +--> npm install
    |
    +--> npm test
    |
    +--> SonarQube Code Analysis
    |         |
    |         +--> Quality Gate FAIL --> Stop pipeline + notification
    |
    +--> Docker Build
    |
    +--> Docker Push
              |
              v
          Docker Hub
              |
              v
       update-image.sh
              |
              v
GitHub - Kubernetes Manifest Repository
              |
              | GitOps change
              v
           Argo CD
              |
              | Sync
              v
      Amazon EKS / Kubernetes
              |
              v
       Node.js Application
```

The pipeline separates **Continuous Integration** from **Continuous
Deployment**:

-   **Jenkins** handles CI: build, test, code analysis, container build,
    and image publishing.
-   **SonarQube** performs static code analysis and quality validation.
-   **Docker Hub** stores versioned container images.
-   A lightweight **shell script** updates the Kubernetes image tag in
    the GitOps repository.
-   **Argo CD** watches the manifest repository and synchronizes changes
    to Kubernetes.
-   **Amazon EKS** runs the containerized Node.js application.

------------------------------------------------------------------------

## 🎯 Project Objectives

-   Build a complete CI/CD pipeline for a Node.js application.
-   Automate dependency installation and unit/integration testing.
-   Integrate SonarQube for static code analysis.
-   Enforce a quality gate before container publishing.
-   Build versioned Docker images automatically.
-   Push application images to Docker Hub.
-   Implement GitOps using a separate Kubernetes manifest repository.
-   Automatically update Kubernetes image tags using a shell script.
-   Deploy applications to Amazon EKS through Argo CD.
-   Demonstrate rolling deployment and Kubernetes health checks.
-   Keep the architecture simple enough to reproduce as a personal
    DevOps portfolio project.

------------------------------------------------------------------------

## 🛠️ Technology Stack

  Category                Technology
  ----------------------- ---------------------------
  Application             Node.js, Express.js
  Testing                 Jest, Supertest
  Source Control          Git, GitHub
  CI                      Jenkins
  Code Quality            SonarQube
  Containerization        Docker
  Container Registry      Docker Hub
  Orchestration           Kubernetes
  Cloud                   Amazon Web Services (AWS)
  Kubernetes Platform     Amazon EKS
  GitOps / CD             Argo CD
  Automation              Bash Shell Script
  Infrastructure Access   AWS CLI, kubectl
  Notifications           Slack / Email (optional)

------------------------------------------------------------------------

## 🏗️ Architecture

### End-to-End CI/CD & GitOps Architecture

The following architecture shows the complete flow from a developer code push through Jenkins CI, SonarQube quality validation, Docker image publishing, GitOps manifest update, Argo CD synchronization, and deployment to Amazon EKS.

<p align="center">
  <img src="docs/architecture.png" alt="Node.js CI/CD and GitOps Architecture" width="100%">
</p>

### Pipeline Flow

```text
Developer
    |
    | Push Code
    v
GitHub - Application Repository
    |
    | Webhook / SCM Trigger
    v
Jenkins
    |
    +--> npm ci
    |
    +--> npm test
    |
    +--> SonarQube Analysis
    |         |
    |         +--> FAIL --> Report / Exit
    |
    +--> Docker Build
    |
    +--> Docker Push
              |
              v
          Docker Hub
              |
              v
       update-image.sh
              |
              v
GitHub - Kubernetes Manifest Repository
              |
              | GitOps change
              v
           Argo CD
              |
              | Sync
              v
        Amazon EKS
              |
              v
       Node.js Application
```

## 🔄 CI/CD Workflow

### 1. Developer pushes code

A developer modifies the Node.js application and pushes the changes to
GitHub.

``` bash
git add .
git commit -m "Update application"
git push origin main
```

------------------------------------------------------------------------

### 2. Jenkins starts the pipeline

Jenkins checks out the latest application source code.

``` text
GitHub
   |
   v
Jenkins
   |
   v
Checkout
```

------------------------------------------------------------------------

### 3. Install dependencies

Jenkins executes:

``` bash
npm ci
```

This installs dependencies from `package-lock.json` in a reproducible
way.

------------------------------------------------------------------------

### 4. Run tests

The pipeline executes:

``` bash
npm test
```

Jest and Supertest validate the Node.js application.

If tests fail:

``` text
Pipeline
   |
   +--> Test FAILED
           |
           v
      Pipeline stops
```

No Docker image is released.

------------------------------------------------------------------------

### 5. SonarQube analysis

The source code is analyzed by SonarQube for areas such as:

-   Bugs
-   Vulnerabilities
-   Code smells
-   Duplicated code
-   Test coverage

A quality gate is used to decide whether the pipeline can continue.

``` text
SonarQube
    |
    +---- PASS ---> Docker Build
    |
    +---- FAIL ---> Report + Exit
```

------------------------------------------------------------------------

### 6. Build Docker image

After the quality checks pass, Jenkins builds the application image:

``` bash
docker build -t <dockerhub-user>/node-cicd-app:<BUILD_NUMBER> .
```

The Jenkins build number is used as the image tag so releases can be
traced back to individual CI builds.

Example:

``` text
node-cicd-app:15
node-cicd-app:16
node-cicd-app:17
```

------------------------------------------------------------------------

### 7. Push image to Docker Hub

Jenkins authenticates to Docker Hub using Jenkins credentials and pushes
the immutable build image:

``` bash
docker push <dockerhub-user>/node-cicd-app:<BUILD_NUMBER>
```

------------------------------------------------------------------------

### 8. Update Kubernetes manifest

A Bash script updates the image tag in the GitOps repository.

Example:

``` yaml
image: <dockerhub-user>/node-cicd-app:15
```

becomes:

``` yaml
image: <dockerhub-user>/node-cicd-app:16
```

The script commits and pushes the change to the Kubernetes manifest
repository.

------------------------------------------------------------------------

### 9. Argo CD detects the Git change

Argo CD continuously monitors the manifest repository.

When the image tag changes:

``` text
Git change
    |
    v
Argo CD
    |
    v
Sync
    |
    v
Kubernetes
```

------------------------------------------------------------------------

### 10. Kubernetes deploys the new version

Kubernetes updates the application deployment.

The application is exposed through a Kubernetes Service and can use
readiness/liveness probes to verify application health.

------------------------------------------------------------------------

## 📁 Repository Structure

### Application Repository

``` text
node-cicd-app/
│
├── app.js
├── server.js
├── package.json
├── package-lock.json
│
├── test/
│   └── app.test.js
│
├── Dockerfile
├── .dockerignore
├── Jenkinsfile
├── sonar-project.properties
│
├── scripts/
│   └── update-image.sh
│
└── README.md
```

### Kubernetes Manifest Repository

``` text
node-cicd-manifests/
│
├── deployment.yaml
├── service.yaml
├── argocd-application.yaml
└── README.md
```

Keeping application code and Kubernetes manifests in separate
repositories demonstrates a GitOps-oriented workflow.

------------------------------------------------------------------------

## 🧪 Node.js Application

The sample application provides simple endpoints:

### Application endpoint

``` text
GET /
```

Example response:

``` json
{
  "message": "Hello from Node.js CI/CD!",
  "version": "1.0.0"
}
```

### Health endpoint

``` text
GET /health
```

Example response:

``` json
{
  "status": "UP"
}
```

The `/health` endpoint is used by Kubernetes health probes.

------------------------------------------------------------------------

## 🐳 Docker

Build locally:

``` bash
docker build -t node-cicd-app:local .
```

Run:

``` bash
docker run --rm -p 3000:3000 node-cicd-app:local
```

Test:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## ☸️ Kubernetes Deployment

The Kubernetes deployment contains:

-   Deployment
-   Multiple application replicas
-   Resource requests and limits
-   Readiness probe
-   Liveness probe
-   ClusterIP Service

Example:

``` yaml
replicas: 2
```

This allows Kubernetes to maintain multiple application pods and perform
rolling updates.

------------------------------------------------------------------------

## ☁️ Amazon EKS

The application is deployed to an Amazon EKS cluster.

Typical deployment flow:

``` text
Docker Image
     |
     v
Docker Hub
     |
     v
Argo CD
     |
     v
Amazon EKS
     |
     v
Kubernetes Deployment
     |
     v
Node.js Pods
```

Useful commands:

``` bash
kubectl get nodes
kubectl get pods -n node-app
kubectl get svc -n node-app
kubectl get deployment -n node-app
```

------------------------------------------------------------------------

## 🔱 Argo CD GitOps

Argo CD is responsible for continuous deployment.

The desired Kubernetes state is stored in Git.

``` text
Git Repository
      |
      | Desired State
      v
    Argo CD
      |
      | Reconciliation
      v
 Kubernetes Cluster
```

This means the Git repository acts as the source of truth for the
deployment configuration.

------------------------------------------------------------------------

## 🔁 Image Update Automation

Instead of adding another image-updater service, this project uses a
lightweight shell script.

The script:

1.  Reads the Jenkins build number.
2.  Identifies the new Docker image tag.
3.  Clones the Kubernetes manifest repository.
4.  Updates `deployment.yaml`.
5.  Commits the manifest change.
6.  Pushes the change to GitHub.
7.  Argo CD detects the Git change.
8.  Argo CD synchronizes Kubernetes.

Example:

``` text
Jenkins Build #15
       |
       v
Docker Hub
       |
       v
node-cicd-app:15
       |
       v
update-image.sh
       |
       v
deployment.yaml
       |
       v
GitHub Manifest Repo
       |
       v
Argo CD
       |
       v
EKS
```

------------------------------------------------------------------------

## 🔐 Security Considerations

Secrets are not stored directly in the Jenkinsfile.

The project uses Jenkins Credentials for:

-   GitHub authentication
-   Docker Hub authentication
-   SonarQube authentication

Recommended practices:

-   Use GitHub Personal Access Tokens instead of passwords.
-   Use Docker Hub access tokens.
-   Store credentials in Jenkins Credentials Manager.
-   Never commit secrets to Git.
-   Use `.gitignore` for local secret/configuration files.
-   Use Kubernetes Secrets or AWS Secrets Manager for sensitive runtime
    configuration.

------------------------------------------------------------------------

## 📊 CI Pipeline Stages

``` text
+--------------------+
| Checkout           |
+---------+----------+
          |
          v
+--------------------+
| npm ci             |
+---------+----------+
          |
          v
+--------------------+
| npm test           |
+---------+----------+
          |
          v
+--------------------+
| SonarQube Analysis |
+---------+----------+
          |
          v
+--------------------+
| Quality Gate       |
+---------+----------+
          |
          v
+--------------------+
| Docker Build       |
+---------+----------+
          |
          v
+--------------------+
| Docker Push        |
+---------+----------+
          |
          v
+--------------------+
| Update GitOps Repo |
+---------+----------+
          |
          v
+--------------------+
| Argo CD Sync       |
+---------+----------+
          |
          v
+--------------------+
| Amazon EKS         |
+--------------------+
```

------------------------------------------------------------------------

## 🛑 Failure Handling

The pipeline is designed to stop before deployment when validation
fails.

### Test failure

``` text
npm test
   |
   +--> FAIL
          |
          v
     Pipeline stops
```

### SonarQube quality failure

``` text
SonarQube
   |
   +--> FAIL
          |
          v
     Pipeline stops
          |
          v
     Notification
```

The Docker image and GitOps manifest are not updated when the required
CI checks fail.

------------------------------------------------------------------------

## 🔔 Notifications

The pipeline can be integrated with:

-   Slack
-   Email
-   Microsoft Teams
-   Other Jenkins-supported notification mechanisms

Notifications can be triggered for:

-   Successful builds
-   Failed builds
-   Test failures
-   SonarQube quality failures
-   Deployment failures

------------------------------------------------------------------------

## 🖥️ Local Development Setup

For a cost-conscious learning environment, Jenkins and SonarQube can run
locally using Docker Desktop.

``` text
Windows PC
│
├── Docker Desktop
│   ├── Jenkins
│   └── SonarQube
│
├── Node.js
├── Git
├── AWS CLI
└── kubectl
```

Argo CD runs inside the EKS cluster rather than requiring a separate EC2
instance.

This reduces unnecessary cloud infrastructure for a personal portfolio
project.

------------------------------------------------------------------------

## 🚀 Running the Project Locally

### Clone

``` bash
git clone https://github.com/<your-username>/node-cicd-app.git
cd node-cicd-app
```

### Install dependencies

``` bash
npm ci
```

### Run tests

``` bash
npm test
```

### Start application

``` bash
npm start
```

Application:

``` text
http://localhost:3000
```

Health endpoint:

``` text
http://localhost:3000/health
```

------------------------------------------------------------------------

## 📌 Future Improvements

Potential improvements for the project include:

-   Add Helm charts for Kubernetes deployment.
-   Add Kubernetes Horizontal Pod Autoscaler.
-   Add Prometheus and Grafana monitoring.
-   Add centralized logging with Loki.
-   Add Trivy container vulnerability scanning.
-   Add OWASP dependency scanning.
-   Replace Docker Hub with Amazon ECR.
-   Use AWS Secrets Manager for runtime secrets.
-   Use GitHub Actions as an alternative CI implementation.
-   Move Jenkins to a dedicated CI worker when moving toward a
    production-style environment.
-   Add AWS Load Balancer Controller and an Ingress.
-   Add Terraform to provision the AWS infrastructure.
-   Add automated rollback strategies.
-   Add deployment approval gates for production environments.

------------------------------------------------------------------------

## 📸 Pipeline Evidence

The following screenshots capture the key stages of the implemented pipeline.

### 1. Jenkins CI Pipeline

Shows the Jenkins pipeline executing the Node.js CI stages, including dependency installation, testing, SonarQube analysis, Docker build, and image publishing.

<p align="center">
  <img src="docs/jenkins-pipeline.png" alt="Jenkins CI Pipeline" width="90%">
</p>

### 2. SonarQube Code Analysis

Shows the SonarQube analysis and quality results used as a validation stage before the Docker image is released.

<p align="center">
  <img src="docs/sonarqube-analysis.png" alt="SonarQube Code Analysis" width="90%">
</p>

### 3. Docker Hub Image

Shows the versioned Node.js application image published by Jenkins after the CI checks pass.

<p align="center">
  <img src="docs/dockerhub-image.png" alt="Docker Hub Node.js Image" width="90%">
</p>

### 4. Argo CD GitOps Synchronization

Shows Argo CD detecting the GitOps manifest change and synchronizing the new application version to Kubernetes.

<p align="center">
  <img src="docs/argocd-sync.png" alt="Argo CD GitOps Synchronization" width="90%">
</p>

### Architecture + Evidence

```text
                    CI
Developer → GitHub → Jenkins → Tests → SonarQube
                              │
                              ▼
                         Quality Gate
                              │
                              ▼
                       Docker Build/Push
                              │
                              ▼
                         Docker Hub
                              │
                              ▼
                       GitOps Manifest
                              │
                              ▼
                           Argo CD
                              │
                              ▼
                           AWS EKS
                              │
                              ▼
                        Node.js App
```

> **Note:** Keep the image filenames exactly as shown above and place them under the repository's `docs/` directory so the relative Markdown paths work correctly on GitHub.

## 🎓 DevOps Concepts Demonstrated

This project demonstrates practical experience with:

-   CI/CD pipeline design
-   Git-based workflows
-   Jenkins Pipeline
-   Automated testing
-   Static code analysis
-   Quality gates
-   Docker image creation
-   Container registries
-   Kubernetes deployments
-   Kubernetes health probes
-   Amazon EKS
-   GitOps
-   Argo CD
-   Infrastructure/application separation
-   Automated manifest updates
-   Versioned container images
-   Credential management
-   Deployment automation
-   Failure handling

------------------------------------------------------------------------

## 💼 Resume Description

### Node.js CI/CD & GitOps Deployment Platform

**Tech:** Jenkins, SonarQube, Docker, Docker Hub, Kubernetes, Amazon
EKS, Argo CD, GitHub, Bash

-   Built an end-to-end CI/CD pipeline for a containerized Node.js
    application using Jenkins, automated npm testing, SonarQube quality
    gates, and Docker image publishing.
-   Implemented GitOps-based continuous delivery using a separate
    Kubernetes manifest repository and Argo CD on Amazon EKS.
-   Automated Kubernetes image-tag updates with a Bash script, enabling
    Jenkins-to-GitOps-to-Argo CD deployment flow with versioned Docker
    images.
-   Configured Kubernetes deployments with multiple replicas, resource
    requests/limits, readiness probes, and liveness probes for reliable
    application rollout.
-   Implemented credential-based authentication for GitHub, Docker Hub,
    and SonarQube while keeping secrets out of source control.

------------------------------------------------------------------------

## ⭐ Project Highlights

``` text
✓ Automated CI pipeline
✓ Automated testing
✓ SonarQube quality gate
✓ Docker image versioning
✓ Docker Hub publishing
✓ GitOps workflow
✓ Automated manifest update
✓ Argo CD continuous deployment
✓ Amazon EKS deployment
✓ Kubernetes health checks
✓ Failure handling
✓ Separate application and manifest repositories
```

------------------------------------------------------------------------

## 📄 License

This project is intended for educational and portfolio purposes.

Add your preferred license if you plan to distribute the project
publicly.

------------------------------------------------------------------------

## 👨‍💻 Author

**Your Name**

GitHub: `https://github.com/<your-username>`

LinkedIn: `https://www.linkedin.com/in/<your-profile>/`
