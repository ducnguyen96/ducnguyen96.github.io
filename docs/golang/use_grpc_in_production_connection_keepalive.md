---
sidebar_position: 1
---

# Sử dụng gRPC trong Production - Connection keepalive

Hướng dẫn gRPC `quickstart` làm rất tốt công việc giúp các developers bắt đầu sử dụng gRPC trong các dự án của họ, nhưng việc deploy production không được thảo luận và các resource có sẵn cũng khá ít.

Trong bài này, ta sẽ thảo luận về một deployment scenario phổ biến và tránh các lỗi.

## Tổng quan

Trong ví dụ của chúng ta, ta có một monolithic NodeJS app đang chạy trên production và được maintain bởi 1 team developers. Để phát triển một tính năng mới, ta chọn xây dựng microservice bằng Python và tận dụng các thư viện machine learning của nó. NodeJS app giao tiếp với microservice Python qua gRPC. Mỗi instance của node duy trì một gRPC connection với Python.

Ta chọn sử dụng 1 cân bằng tải Layer 3 tiêu chuẩn để scale Python microservices theo hàng ngang.

Python microservice được built như 1 Docker container và chúng ta sử dụng `red-black` deployment strategy để gỡ các phiên bản cũ hơn.

## Connection Keepalive

gRPC sử dụng `keepalive` ping như một cách để kiểm tra xem một `channel` đang hoạt động hay không bằng cách gửi các HTTP2 ping qua `tcp`. Nó được gửi theo chu kỳ và nếu ping không được `ack` bởi peer (đối tượng kết nối) trong một khoảng thời gian nhất định, quá trình truyền tải sẽ bị ngắt kết nối[1]. Tuy nhiên, khoảng thời gian mặt định của `keepalive ping` được đặt là 2 giờ và chỉ được gửi ở phía server. Điều này có nghĩa là khi một server gRPC cũ bị loại bỏ bởi một deployment mới hơn hoặc đơn giản là bị lỗi, client chỉ phát hiện ra khi cố gắng và không gửi được request. Là một giá trị mặc định, nó hoạt động tốt vì nó ngăn mạng bị ngập bởi các ping vô ích khi các services không cần đến chúng. Tuy nhiên, trên thực tế, ta thường muốn phát hiện các gián đoạn sớm hơn và việc giữ khoảng thời gian dài sẽ làm mất điểm đối với người dùng mới cố gắng truy cập dịch vụ trong khi gRPC client không biết server đang bị lỗi.

Khi điều này xảy ra, lỗi này thường xuất hiện ở phía client.

Ta có thể làm cho gRPC phát hiện các unavailable services nhanh hơn bằng cách điều chỉnh các `keepalive options`. Ở phía server, ta có thể thay đổi `initializer code` để bao gồm các `keepalive options`:

```go
// gRPC server
	srvParams := keepalive.ServerParameters{
		Time:                  10 * time.Second, // default value is 2 hours
		Timeout:               5 * time.Second,  // default value is 20 seconds
	}
	opts := []grpc.ServerOption{grpc.KeepaliveParams(srvParams)}
	s := grpc.NewServer(opts...)
```

Ở phía client ta cũng có thể thêm các options này

```go
// Set up a connection to the server.
	kacp := keepalive.ClientParameters{
		Time:                10 * time.Second, // send pings every 20 seconds if there is no activity
		Timeout:             5 * time.Second,  // wait 5 second for ping back
		PermitWithoutStream: true,             // send pings even without active streams
	}

	authConn, err := grpc.Dial("localhost:50051", grpc.WithInsecure(), grpc.WithKeepaliveParams(kacp))
```

Những options trên cho phép clients và servers phát hiện ra gián đoạn kết nối nhanh hơn và thiết lập lại kết nối khác thông qua `Load Balancer`.

Tham khảo: https://cs.mcgill.ca/~mxia3/2019/02/23/Using-gRPC-in-Production/
