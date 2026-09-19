# Node.js CI/CD Pipeline with Jenkins, SonarQube, Docker, Argo CD & Amazon EKS

A production-style **CI/CD and GitOps pipeline for a Node.js
application**, demonstrating automated testing, static code analysis,
containerization, Docker image publishing, Kubernetes manifest updates,
and continuous deployment to **Amazon EKS** using **Argo CD**.

The project is inspired by the Jenkins Zero To Hero CI/CD workflow by Abhishek Veeramalla and
adapted for a lightweight Node.js application.

------------------------------------------------------------------------

## 🏗️ Architecture

### End-to-End CI/CD & GitOps Architecture

The following architecture shows the complete flow from a developer code push through Jenkins CI, SonarQube quality validation, Docker image publishing, GitOps manifest update, Argo CD synchronization, and deployment to Amazon EKS.

<p align="center">
  <img src="docs/architecture.png" alt="Node.js CI/CD and GitOps Architecture" width="100%">
</p>


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
    | generic webhook trigger
    v
Jenkins
    |
    +--> npm install
    |
    +--> npm test
    |
    +--> SonarQube Code Analysis
    |         |
    |         +--> Quality Gate FAIL --> Stop pipeline + Report
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

## 🔄 CI/CD Workflow

### 1. Developer pushes code

A developer modifies the Node.js application and pushes the changes to
GitHub.

``` bash
git add .
git commit -m "Added version 1.0.4"
git push origin main
```
<p align="center">
  <img src="docs/screenshots/01-Github-commit-version-1.0.4.jpeg" alt="Github commit" width="100%">
</p>


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

<p align="center">
  <img src="docs/screenshots/03-jenkins-stages-success.jpeg" alt="Jenkins stages sucsess" width="100%">
</p>


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

<p align="center">
  <img src="docs/screenshots/04-sonarqube-analysis.jpeg" alt="Sonarqube analysis" width="100%">
</p>


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
docker build -t <dockerhub-user>/node-cicd-app:08 .
```

The Jenkins build number is used as the image tag so releases can be
traced back to individual CI builds.

Example:

``` text
node-cicd-app:07
node-cicd-app:06
node-cicd-app:05
```

------------------------------------------------------------------------

### 7. Push image to Docker Hub

Jenkins authenticates to Docker Hub using Jenkins credentials and pushes
the immutable build image:

``` bash
docker push <dockerhub-user>/node-cicd-app:08 
```
<p align="center">
  <img src="docs/screenshots/05-dockerhub-image.jpeg" alt="Docker Hub image" width="100%">
</p>


------------------------------------------------------------------------

### 8. Update Kubernetes manifest

A Bash script updates the image tag in the GitOps repository.

Example:

``` yaml
image: <dockerhub-user>/node-cicd-app:07
```

becomes:

``` yaml
image: <dockerhub-user>/node-cicd-app:08
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
<p align="center">
  <img src="docs/screenshots/09-argocd-application.jpeg" alt="argocd application" width="100%">
</p>


------------------------------------------------------------------------

### 10. Kubernetes deploys the new version

Kubernetes updates the application deployment.

The application is exposed through a Kubernetes Service and can use
readiness/liveness probes to verify application health.

<p align="center">
  <img src="docs/screenshots/06-kubernetes-pods.jpeg" alt="Kubernetes pods" width="100%">
</p>

<p align="center">
  <img src="docs/screenshots/10-running-application.jpeg" alt="Application running" width="100%">
</p>
------------------------------------------------------------------------

## 📁 Repository Structure

### Application Repository

``` text
node-cicd-app/
│
├── app.js
├── package.json
├── package-lock.json
├── Dockerfile
├── Jenkinsfile
├── .gitignore
├── README.md
│
├── node-cicd-manifests/
│   ├── deployment.yaml
│   └── service.yaml
│   └── argocd-application.yaml
│
└── docs/
    │
    ├── architecture.png
    │
    └── screenshots/
        ├── 01-Github-commit-version-1.0.4.png
        ├── 02-jenkins-pipeline-webhook-trigger.png
        ├── 03-jenkins-stages-success.png
        ├── 04-sonarqube-analysis.png
        ├── 05-dockerhub-image.png
        ├── 06-kubernetes-pods.png
        ├── 07-kubernetes-service.png
        ├── 08-argocd-synced.png
        ├── 09-argocd-application.png
        ├── 10-running-application.jpeg
        ├── 11-gitops-commit.png
        └── 12-webhook-loop-prevention.png
```

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

## 📄 License

This project is intended for educational and portfolio purposes.


------------------------------------------------------------------------

## 👨‍💻 Author

**Your Name**

GitHub: `https://github.com/Vivek7964`

LinkedIn: `https://www.linkedin.com/in/bukkasamudram-vivekananda-reddy-244808294/`
