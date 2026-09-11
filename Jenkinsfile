pipeline {

    agent any
    triggers {
        GenericTrigger(
            genericVariables: [
                [
                    key: 'COMMIT_MESSAGE',
                    value: '$.head_commit.message'
                ]
            ],

            causeString: 'GitHub push: $COMMIT_MESSAGE',

            token: 'node-cicd-webhook',

            printContributedVariables: false,
            printPostContent: false,

            regexpFilterText: '$COMMIT_MESSAGE',

            regexpFilterExpression: '^(?!.*\\[skip ci\\]).*$'
        )
    }
    options {
        disableConcurrentBuilds()
    }

    environment {

        DOCKER_IMAGE = "vivek200420/node-cicd-app"

        SONARQUBE_SERVER = "sonarqube"
    }

    stages {

        /*
         * ============================================================
         * CHECKOUT
         * ============================================================
         */

        stage("Checkout") {
            steps {
                git(
                    url: 'https://github.com/Vivek7964/node-cicd-app.git',
                    branch: 'main',
                    credentialsId: 'github-credentials'
                )
            }
        }


        /*
         * ============================================================
         * INSTALL DEPENDENCIES
         * ============================================================
         */

        stage("Install Dependencies") {
            steps {
                sh "npm ci"
            }
        }


        /*
         * ============================================================
         * TEST
         * ============================================================
         */

        stage("Test") {
            steps {
                sh "npm test"
            }
        }


        /*
         * ============================================================
         * SONARQUBE
         * ============================================================
         */

        stage("SonarQube") {
            steps {

                withSonarQubeEnv("${SONARQUBE_SERVER}") {

                    withCredentials([
                        string(
                            credentialsId: "sonar-token",
                            variable: "SONAR_TOKEN"
                        )
                    ]) {

                        sh """
                            sonar-scanner \
                            -Dsonar.projectKey=node-cicd-app \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=node_modules/**,coverage/**,test/** \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.token=\$SONAR_TOKEN
                        """
                    }
                }
            }
        }


        /*
         * ============================================================
         * DOCKER BUILD
         * ============================================================
         */

        stage("Docker Build") {
            steps {

                sh """
                    docker build \
                    -t ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                    .
                """
            }
        }


        /*
         * ============================================================
         * DOCKER PUSH
         * ============================================================
         */

        stage("Docker Push") {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub-credentials",
                        usernameVariable: "DOCKER_USERNAME",
                        passwordVariable: "DOCKER_PASSWORD"
                    )
                ]) {

                    sh """

                        echo \$DOCKER_PASSWORD | docker login \
                        -u \$DOCKER_USERNAME \
                        --password-stdin

                        docker push \
                        ${DOCKER_IMAGE}:${BUILD_NUMBER}

                    """
                }
            }
        }


        /*
         * ============================================================
         * UPDATE KUBERNETES MANIFEST
         * ============================================================
         */

        stage("Update Manifest") {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "github-credentials",
                        usernameVariable: "GITHUB_USERNAME",
                        passwordVariable: "GITHUB_TOKEN"
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Updating Kubernetes manifest"
                        echo "=========================================="

                        sed -i "s|image: .*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|" \
                        node-cicd-manifests/deployment.yaml


                        echo ""
                        echo "Updated image:"
                        grep "image:" node-cicd-manifests/deployment.yaml


                        echo ""
                        echo "Configuring Git..."

                        git config user.name "jenkins"
                        git config user.email "jenkins@example.com"


                        echo ""
                        echo "Adding manifest..."

                        git add node-cicd-manifests/deployment.yaml


                        echo ""
                        echo "Creating Jenkins manifest commit..."

                        git commit \
                            -m "Update Node.js image to ${BUILD_NUMBER} [skip ci]" \
                            || true


                        echo ""
                        echo "Creating Git authentication..."

                        printf '#!/bin/sh
case "$1" in
    *Username*) echo "$GITHUB_USERNAME" ;;
    *Password*) echo "$GITHUB_TOKEN" ;;
esac
' > /tmp/git-askpass.sh


                        chmod 700 /tmp/git-askpass.sh


                        export GIT_ASKPASS=/tmp/git-askpass.sh
                        export GIT_TERMINAL_PROMPT=0


                        echo ""
                        echo "Fetching latest main from GitHub..."

                        git fetch origin main


                        echo ""
                        echo "Rebasing Jenkins commit..."

                        git rebase origin/main


                        echo ""
                        echo "Pushing manifest update..."

                        git push origin HEAD:main


                        echo ""
                        echo "=========================================="
                        echo "Manifest pushed successfully"
                        echo "=========================================="


                        rm -f /tmp/git-askpass.sh
                    '''
                }
            }
        }
    }


    /*
     * ================================================================
     * POST ACTIONS
     * ================================================================
     */

    post {

        success {

            echo """
            ==========================================
            PIPELINE SUCCESS
            ==========================================

            Docker Image:
            ${DOCKER_IMAGE}:${BUILD_NUMBER}

            Kubernetes manifest updated successfully.

            Argo CD will detect the Git change
            and synchronize the application to EKS.

            ==========================================
            """
        }


        failure {

            echo """
            ==========================================
            PIPELINE FAILED
            ==========================================

            Build Number:
            ${BUILD_NUMBER}

            Check the failed stage above.

            ==========================================
            """
        }


        always {

            echo "Jenkins Pipeline completed."
        }
    }
}