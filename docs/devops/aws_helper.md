---
sidebar_position: 2
---

# AWS Helper

## 1. Cài đặt AWS CLI

```sh
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## 2. Config basics AWS

1. Tạo user ở đây. Sau khi create user. Lúc đấy bạn cũng đã cấp luôn Access Key ID và Access Secret Key cho user đấy luôn. Nếu bạn quên Access Key ID click vào Users. Click vào tab Security credentials để lấy lại Access Key Id. Nếu quên hoặc mất secret key thì chỉ còn cách là tạo mới.
2. Configure AWS với keys ở trên

```sh
aws configure
```

3. Login

```sh
aws ecr get-login-password --region $MY_AWS_REGION | docker login --username AWS --password-stdin $MY_AWS_REPO
```

## 3. Tạo repo

```sh
aws ecr create-repository \
 --repository-name hello-world \
 --image-scanning-configuration scanOnPush=true \
 --region $MY_AWS_REGION
```

## 4. Push to AWS ECR

```sh
docker tag hello-world:latest $MY_AWS_REPO/hello-world:latest
docker push $MY_AWS_REPO/hello-world:latest
```

## 5. Pull image from AWS ECR

```sh
docker pull $MY_AWS_REPO/hello-world:latest
```
