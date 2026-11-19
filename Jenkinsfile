pipeline {
    agent any
    options { skipDefaultCheckout(true); timestamps() }
    parameters {
        booleanParam(name: 'BLOCK_ON_HIGH_CRITICAL', defaultValue: false,
            description: 'Fail before push when Trivy finds HIGH or CRITICAL vulnerabilities.')
    }
    triggers { pollSCM('H/5 * * * *') }
    environment { TRIVY_IMAGE = 'aquasec/trivy:0.76.2' }
    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                git branch: 'main', url: 'https://github.com/lzkhouloud23/khouloud.git'
            }
        }
        stage('SERVER: build, scan, push') {
            when {
                anyOf {
                    changeset 'server/**'
                    changeset 'Jenkinsfile'
                    expression { env.BUILD_NUMBER == '1' }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        set -eu
                        image="$DH_USER/mern-server:$BUILD_NUMBER"
                        docker build -t "$image" server
                        docker save "$image" | docker run --rm -i "$TRIVY_IMAGE" image \
                            --input /dev/stdin --scanners vuln \
                            --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                            --format table > trivy_server.txt
                        cat trivy_server.txt
                        if [ "$BLOCK_ON_HIGH_CRITICAL" = "true" ]; then
                            docker save "$image" | docker run --rm -i "$TRIVY_IMAGE" image \
                                --input /dev/stdin --scanners vuln \
                                --severity HIGH,CRITICAL --exit-code 1
                        fi
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker push "$image"
                    '''
                }
            }
        }
        stage('CLIENT: build, scan, push') {
            when {
                anyOf {
                    changeset 'client/**'
                    changeset 'Jenkinsfile'
                    expression { env.BUILD_NUMBER == '1' }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        set -eu
                        image="$DH_USER/mern-client:$BUILD_NUMBER"
                        docker build --build-arg REACT_APP_API_URL=http://localhost:9000 -t "$image" client
                        docker save "$image" | docker run --rm -i "$TRIVY_IMAGE" image \
                            --input /dev/stdin --scanners vuln \
                            --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                            --format table > trivy_client.txt
                        cat trivy_client.txt
                        if [ "$BLOCK_ON_HIGH_CRITICAL" = "true" ]; then
                            docker save "$image" | docker run --rm -i "$TRIVY_IMAGE" image \
                                --input /dev/stdin --scanners vuln \
                                --severity HIGH,CRITICAL --exit-code 1
                        fi
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker push "$image"
                    '''
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'trivy_*.txt', allowEmptyArchive: true
            script {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        docker logout || true
                        docker image rm \
                            "$DH_USER/mern-server:$BUILD_NUMBER" \
                            "$DH_USER/mern-client:$BUILD_NUMBER" \
                            2>/dev/null || true
                    '''
                }
            }
        }
    }
}
