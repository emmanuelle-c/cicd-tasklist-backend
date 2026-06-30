pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Generate Prisma client') {
            steps {
                sh 'npm run prisma:generate'
            }
        }
        stage('Run Tests unit and coverage') {
            steps {
                sh 'npm run test && npm run test:coverage'
            }
        }
        stage('Run Tests e2e and coverage') {
            steps {
                sh 'npm run test:e2e && npm run test:e2e:coverage'
            }
        }
        stage('Publish tests on Jenkins') {
            steps {
                junit '**/reports/junit.xml'
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
        stage('Analysis with SonarQube') {
            steps {
                withSonarQubeEnv('sonarqube-token-emmanuelle-c') {
                    sh 'npm run sonar'
                }
            }
        }
        stage('Build Docker image') {
            steps {
                sh 'docker build -t cicd-tasklist-backend .'
            }
        }
        stage('Scan image with Trivy') {
            steps {
                sh 'trivy image cicd-tasklist-backend'
            }
        }
        stage('Generate SBOM with Trivy') {
            steps {
                sh 'trivy image --format cyclonedx --output ./reports/sbom.json cicd-tasklist-backend'
            }
        }
        stage('Push Docker image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials-emmanuelle-c', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh 'docker tag cicd-tasklist-backend $DOCKER_USERNAME/cicd-tasklist-backend:latest'
                    sh 'docker push $DOCKER_USERNAME/cicd-tasklist-backend:latest'
                }
            }
        }
    }    
    post {
        always {
            cleanWs()
        }
    }
}