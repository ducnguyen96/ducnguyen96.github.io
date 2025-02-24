import type { ReactNode } from "react";
import Layout from "@theme/Layout";
export default function Home(): ReactNode {
  return (
    <Layout>
      <main>
        <div className="container">
          <p>
            <img
              style={{
                maxWidth: "25%",
                borderRadius: "50%",
                float: "right",
                marginLeft: "3rem",
              }}
              src="img/ducnguyen.png"
              alt="avatar"
            />
          </p>
          <p>
            Chào mọi người, mình là Đức, là một software enginner là đang tập
            tành viết lách 😅. Mình đến từ quê hương của kẹo Cu Đơ - Hà Tĩnh.
          </p>
          <p>
            Hiện tại thì mình đang freelance các dự án dùng Node/Go/Python/React
            và song song là học và nghiên cứu về cách xây dựng và triển khai các
            hệ thống ML/AL.
          </p>
          <p>
            Trước đây thì mình từng nhận nhiệm vụ xử lý ảnh cho một startup. Sau
            đó chuyển hướng dần làm Backend enginner và nhận vai trò làm
            Frontend cho một vài dự án tại{" "}
            <a href="https://ntq.com.vn/">NTQ Solution</a> và{" "}
            <a href="https://nsc-software.com/en">NSC Software</a>.
          </p>
          <p>
            Mình là cựu sinh viên{" "}
            <a href="https://hust.edu.vn/">Bách Khoa Hà Nội</a>, chuyên ngành kỹ
            sư ô tô. Mình học đến năm 4 thì cảm thấy không phù hợp với ngành này
            nên đã tìm tìm hiểu{" "}
            <a href="https://www.coursera.org/specializations/machine-learning-introduction?">
              các khóa học ML/DL của thầy Andrew
            </a>{" "}
            cũng như tham khảo các bài viết của a Tiệp từ{" "}
            <a href="https://machinelearningcoban.com/">
              machinelearningcoban.com
            </a>{" "}
            và sau khi ra trường thì rải CV tìm kiếm cơ hội thực tập từ các
            startup cho đến bigtech và bắt đầu con đường software enginner cho
            đến hiện tại.
          </p>
          <p>
            Mình là một <a href="https://nixos.org/">Nix</a> user, thích
            self-host, tuy chưa được nhiều nhưng mình đang cố gắng đóng góp cho
            cộng đồng opensource. Hiện tại thì mình có contribute một số repo về
            Nix và Neovim.
          </p>
          <p>
            Mình thích học những cái mới cũng như thử thách những bài toán khó.
            Nếu muốn collab thì liên hệ với mình qua{" "}
            <a href="mailto:ducng948@gmail.com">email</a> nhé.
          </p>
        </div>
      </main>
    </Layout>
  );
}
