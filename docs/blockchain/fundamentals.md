---
sidebar_position: 1
---

# Fundamentals

## 1. Public and Private Keys

|                 |                                                                    |
| --------------- | ------------------------------------------------------------------ |
| Private key     | Kyc9JCPPKNPrMUopkCc7ng9PU5Bp9SGsjVkh8Hpfx4tCr5LGXgBf               |
| Public key      | 033b368bfccf5921f8a5a42b81b0f5ecdc66583fac8dc13bcf860cf31290964c64 |
| Bitcoin address | 19PacjCFSSt9guX4zZ3GPpXpDrvDNQ7DC4                                 |

![image](/img/docs/blockchain/2021-12-09_22-17.png)

- Private key được dụng để ký các transactions. Cũng là cách mà chủ của địa chỉ bitcoin chứng minh với mạng lưới bitcion rằng họ chính là chủ đích thực của địa chỉ và có thể xác minh transaction được.

- Public keys được sử dụng để generate Bitcoin address. Địa chỉ này thực chất là một phiên bản được nén từ public key, dễ đọc hơn. Public key có thể được chia sẻ với bất kỳ ai, thường là để yêu cầu ai đó gửi bitcoin đến địa chỉ đó.

## 2. UTXO Model

- Các transactions của Bitcoin tuân theo một loại kế toán gọi là `unspent transaction output` (UTXO). Một bitcoin transaction thực chất là một list các inputs và một list các outputs. Mỗi input nhận diện một Bitcoin address mà nó đang cấp tiền, và một `unspent transaction` mà địa chỉ đó nhận được trong quá khứ. Tương tự, mỗi ouput đại diện cho Bitcoin address nhận tiền và số lượng mà địa chỉ đó nhận. Sự khác biệt giữa input và ouput là `transaction fee`, sẽ được nhận bởi Bitcoin miner. Mỗi input cũng chứa một chữ ký điện tử cung cấp thông tin rằng chủ của Bitcoin address đã xác minh transaction.

![image](/img/docs/blockchain/2021-12-09_22-24.png)

- Trong ví dụ ở trên, có tất cả 4 inputs. Có 2 inputs đến cùng một địa chỉ (1HXpg8D9AMGFVZ9FEU2tkZYvAZ8xBhVudo). Tuy nhiên thì 2 inputs này lại đại diện cho 2 transactions khác nhau mà địa chỉ đó đã nhận trong quá khứ. Một cho `0.0027867 BTC` và một cho `0.0034977 BTC`.

- Các inputs trong trường hợp này có tông cộng `0.0128 BTC` và tổng output là `0.01145732 BTC`. Sự khác biệt là `0.00134268 BTC` - số này được trả cho miner người thêm block chứa các transactions trên vào blockchain.

- Dưới đây là ví dụ về một raw transaction:

```json
01000000017967a5185e907a25225574544c31f7b059c1a191d65b53dcc1554d339c4f9efc0100000
06a47304402206a2eb16b7b92051d0fa38c133e67684ed064effada1d7f925c842da401d4f2270220
1f196b10e6e4b4a9fff948e5c5d71ec5da53e90529c8dbd122bff2b1d21dc8a90121039b7bcd0824b
9a9164f7ba098408e63e5b7e3cf90835cceb19868f54f8961a825ffffffff014baf21000000000019
76a914db4d1141d0048b1ed15839d0b7a4c488cd368b0e88ac00000000

```

**Anatomy of a bitcoin transaction**

| Field          | Description                                                                                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version        | 4 bytes. Identifies which protocol version the node generating the transaction is using (currently 1).                                                                                                                                  |
| Flag           | If the flag is present, showing a value of 0001, then the node is using Segregated Witness (SegWit), which removes signature information from the transaction.                                                                          |
| In-counter     | The number of inputs                                                                                                                                                                                                                    |
| List of inputs | List of input data                                                                                                                                                                                                                      |
| Out-counter    | The number of outputs                                                                                                                                                                                                                   |
| List of output | List of output data                                                                                                                                                                                                                     |
| Witnesses      | If using SegWit, then this field shows a list of witnesses.                                                                                                                                                                             |
| Locktime       | 4 bytes. If this field is not empty, it identifies the earliest time that the transaction can be added to the blockchain as determined by the network. This field can be represented as either a block height or a Unix-like timestamp. |

## 3. Transactions

![image](/img/docs/blockchain/2021-12-10_08-45.png)

Trong crypto, transactions đại diện cho sự dich chuyển giá trị từ một địa chỉ này tới một địa chỉ khác. Việc transfer này yêu cầu được ký với private key. Public key tương ứng sau đó được sử dụng bởi người nhận để verify chữ ký và validate transaction. Trong hầu hết cryptocurrencies, người dùng cũng phải trả một khoản phí nhỏ cho network để transaction được thông qua. Phí này, thường là được tặng cho miner.

## 4. Merkle Root

![image](/img/docs/blockchain/mabc_0206.png)

- `Merkle root` được sử dụng để show một snapshot của trạng thái của tất cả transactions trong block hiện tại, được lưu với chỉ 256 bits. Cái tên này đến từ nhà khoa học máy tính `Ralph Merkle`, người phát minh ra `Merkle trees` - là một cấu trúc dữ liệu.
- Merkle root có một mục đích đặc biệt ngoài việc ghi lại transaction snapshot. Khi một node trên mạng muốn đảm bảo nó có danh sách chính xác các transactions như mọi nút khác, nó không cần phải so sánh từng giao dịch riêng lẻ. Thay vào đó, nó chỉ cần so sánh gốc Merkle của nó với mọi gốc Merkle của nút khác. Điều này cho phép xây dụng các software không yêu cầu lưu trữ toàn bộ blockchain để xác thực các giao dịch của riêng họ.
- Nếu số lượng transactions là lẻ thì transaction cuối sẽ được replicated để tiếp tục quá trình trên. Merkle root là một giá trị quan trọng giúp generate block hash.

![image](/img/docs/blockchain/2021-12-10_08-58.png)

Quá trình tính toán Merkle root như sau:

```json
HA = 51d37bdd871c9e1f4d5541be67a6ab625e32028744d7d4609d0c37747b40cd2d
```

```json
HB = 60c25dda8d41f8d3d7d5c6249e2ea1b05a25bf7ae2ad6d904b512b31f997e1a1
```

```json
HC = 01f314cdd8566d3e5dbdd97de2d9fbfbfd6873e916a00d48758282cbb81a45b9
```

```json
HD = b519286a1040da6ad83c783eb2872659eaf57b1bec088e614776ffe7dc8f6d01
```

```json
HA+B = 0d0eb1b4c4b49fd27d100e9cce555d4110594661b1b8ac05a4b8879c84959bd4
HC+D = bfae954bdb9653ceba3721e85a122fba3a585c5762b5ca5abe117b30c36c995e
HA+B + HC+D = Merkle root = 2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3
```

Điều quan trọng nhất ở Merkle root là nó có thể được sử dụng để phát hiện giả mạo trong blockchain. Nếu có bất cứ sự giả mạo hay lỗi transactions trong blockchain của bất cứ node nào thì Merkle root hash sẽ không còn giống với các nodes khác nữa.

## 4. Signing and Validating Transactions

- Mỗi transaction input chứa một chữ ký cung cấp bằng chứng rằng chủ nhân của địa chỉ gửi đã xác thực transaction. Chữ ký được tạo và mã hóa với `ECDSA`, một thuật toán mã hóa nhận private key và transaction data là inputs.

![image](/img/docs/blockchain/mabc_0208.png)

- Khi tất cả các nodes xác thực transaction, chúng có thể dễ dàng verify chữ ký có hợp lệ hay không bằng cách sử dụng hàm verify `ECDSA`.

![image](/img/docs/blockchain/mabc_0209.png)

- Điều quan trọng ở đây là để kiểm tra xem chữ ký có hợp lệ không thì không cần đến private key. Vì vậy, tất cả các nodes có thể dễ dàng xác thực transaction chỉ sử dụng các thông tin được public, nhưng chúng không thể tự tạo ra chữ ký nó yêu cầu private key.

## 5. Coinbase Transaction

![image](/img/docs/blockchain/mabc_0210.png)

- Transaction đầu tiên được ghi lại trên mỗi block được gọi là coinbase transaction, nó được tạo nên từ 2 giá trị:

  - Block reward: Đây là phần thưởng mà miner sẽ nhận được từ network cho việc tạo ra block mới và thực việc công việc của họ đến cung cấp năng lượng xử lý cho mạng lưới Bitcoin.
  - Transaction fees: Đây là tổng tất cả chi phí của transaction. Thường thì có nhiều transaction chờ được xử lý hơn là số lượng mà có thể ghi vào 1 block.

- Coinbase transaction chỉ có một giá trị được gọi là coinbase - blank. Nó cũng có một vài thuộc tính khác

## 6. Transaction Security

Bitcoin transaction là các push transactions, nghĩa là sender - người push một khoản tiền ra khỏi tài khoản mà họ quản lý. Ngược lại thì `pull` transaction được khởi tạo bởi người nhận. Một ví dụ cụ thể là `credit card transaction`: trong trường hợp này thì merchant là người nhận sẽ khởi tạo transaction.

Pull transaction sẽ ít bảo mật hơn nhiều vì chúng yêu cầu người gửi chia sẻ thông tin chi tiết về acccount. Để bù lại cho điểm yếu này, mạng lưới `pull payments` chẳng hạn như Visa sẽ cấp 1 khoản `chargebacks` hoặc là khả năng tranh chấp về transaction hoặc là yêu cầu refund.

Vì sử dụng push transactions, Bitcoin transactions bảo mật hơn nhiều. Khi khởi tạo một transaction, người gửi không phải tiết lộ bất cứ thông tin nào về account của họ. Cách duy nhất để lừa đảo qua transaction là có được private key.

Với khả năng công nghệ ngày nay, không thể đoán hoặc `reverse engineer` private key của một người. Cách duy nhất là dùng `brute force` - đoán tất cả các khả năng.

Một private key là một số 256 bít tương ứng với 2 mũ 256 combinations. Tương ứng với 4 lần 10 tỷ mũ 8.

Tổng sức mạnh tổng hợp của mạng lưới Bitcoin ở năm 2020 lớn hơn tất cả siêu máy tính trên thế giới. Hiện tại bitcoin hash rate - một con số ước tính số lượng hashes đã được tạo ra bởi tất cả các miners để giải một block nào đó - khoảng 80 exahashes(10 mũ 18) mỗi giây.

## 7. Hashes

Là một hàm giúp mã hóa bất cứ dạng dữ liệu nào về một chuổi có kích thước không đổi. Một số đặc điểm của hashes rất thích hợp để dùng trong blockchain:

- Với bất cứ input nào, kết quả luôn có độ dài không thay đổi.
- Mã hóa một chiều.
- Cực kỳ khó - hay có thể xem là không thể để decrypt hash thành dữ liệu ban đầu.
- Với input giống nhau thì kết quả luôn giống nhau.
- Một thay đổi nhỏ trong input thì kết quả sẽ rất khác biệt.
- Khó xảy ra trường hợp cho cùng kết quả nếu input khác nhau.

Có nhiều thuật toán hash nhưng phổ biến nhất là:

- SHA-256: được sử dụng phổ biến trong Bitcoin.
- Keccak-256: được sử dụng phổ biến trong ETH.

### Block hashes

`Block hash` là một snapshot của toàn bộ blockchain tại thời điểm mà block đó được tạo ra. Theo thuật ngữ kế toán thì là một `balance sheet` của toàn bộ network. Mọi node trong mạng đề cập đến block hash đó để xác minh rằng views của nó về network thì giống với node khác. Nếu có dù chỉ là một khác biệt cực kỳ nhỏ trong một `node's ledger` thì hash sẽ trông rất khác.

**Anatomy of a Bitcoin block**

| Field          | Description                                                        | Size (bytes) |
| -------------- | ------------------------------------------------------------------ | ------------ |
| Version        | Block version number                                               | 4            |
| hashPrevBlock  | 256-bit hash of the previous block header                          | 32           |
| hashMerkleRoot | 256-bit hash based on all of the transactions in the current block | 32           |
| Time           | Current block timestamp as seconds since 1970-01-01T00:00 UTC      | 4            |
| Bits           | Current target in compact format                                   | 4            |
| Nonce          | 32-bit number (starts at 0)                                        | 4            |

Có 2 fields quan trọng nhất là `hashPrevBlock` lfa block hash của node kế trước và `hashMerkleRoot` là snapshot của tất cả các transactions có trong block hiện tại.

![image](/img/docs/blockchain/mabc_0211.png)

## 8. Custody: người nắm giữ keys

Trong các dịch vụ tài chính, custody đề cập đến khả năng nắm giữ, di chuyển và bảo vệ tài sản.

### Các loại ví: Custodial và Noncustodial

Tương tự với cách mà con người lưu trữ các giá trị như tiền mặt hoặc credit cards trong một miếng da gấp (ví), tiền mã hóa cũng được lưu trữ trong một thứ được gọi là `wallet` - ví. Tuy nhiên, nó chỉ là một interface để lưu trữ các keys và giữ chúng sao cho bảo mật, tiền mã hóa không thực sự nằm trong bất cứ thiết bị nào, và ví được sử dụng với mục đích duy nhất là lữu các keys liên quan.

Nói chung thì có 2 loại ví: custodial và noncustodial. Một ví custodial được quản lý bởi một thực thể được tin tưởng và người dùng phải truy cập thông qua giao diện web hoặc điện thoại. Những trang web này thì lưu trữ private keys cho users.

Các sàn giao dịch là một ví dụ về custodial wallet - họ giữ tiền mã hóa của bạn trong một tài khoản, sở hữu và điều khiển các keys.

Điểm trừ lớn nhất của loại ví này là nếu sàn phá sản hoặc bỏ trốn với tiền của bạn thì users không thể làm được gì vì họ không trực tiếp sở hữu keys.

Noncustodial wallets cấp toàn bộ quyền điều khiển cho users. Tuy nhiên cũng có điểm trừ. User phải chịu hoàn toàn trách nhiệm cho việc bảo mật các private keys. Nếu bạn đánh mất chúng, thì bạn hoàn toàn không thể truy cập và mất toàn bộ tiền. `Blockchain.com`, được thành lập vào năm 2011, là ví noncustodial lâu đời nhất và lớn nhất.

## 9. Consensus - đồng thuận

Consensus là một cách để đạt được sự đồng thuận giữa các bên tham gia, điều này cực kỳ quan trọng để mạng lưới blockchain thành công. Có 2 cơ chế phổ bến nhất là proof-of-work và proof-of-stake.

### Proof-of-work

Cơ chế này cho phép các giao dịch tiền mã hóa được confirmed và các blocks được published trên Bitcoin blockchain. Được tạo ra ban đầu với mục đích là gắn chặt giá trị kinh tế với các dịch vụ như email thông qua xử lý máy tính để ngăn chặn spam. Giá trị kinh tế được cung cấp trong proof-of-work tương quan trực tiếp đến giá điện năng tiêu thụ cho quá trình đào.

### Block discovery

Khoảng mỗi 10 phút, một block các transactions được confirmed bởi 1 miner. Vì có hàng ngàn miners trên mạng lưới nên để đạt được sự đồng thuận miner nào sẽ có quyền để confirm block mới.

Tất cả các miner phải làm để khám phá ra 1 block mới là tạo ra một Bitcoin block hash mà được xem là hợp lệ bởi network theo 2 tiêu chí sau:

- Là một hash của một block header hợp lệ.
- Block hash là một số nhỏ hơn mục tiêu hiện tại của network.

Mục tiêu thì một con số liên tục thay đổi và phải luôn luôn lớn hơn một block hash hợp lệ. Độ khó là con số trung bình của số lần thử để đạt đưuọc block hash phù hợp. Hash rate của network được xem là số lần mỗi giây miners phải thử để tạo ra một block hash hợp lệ.

Mục tiêu cho mạng lưới, chẳng hạn Bitcoin thì một block hợp lệ mới nên được tạo ra mỗi 10 phút. Theo thời gian, số lượng miners sử dụng sức mạnh xử lý máy tính để khám phá ra 1 block thay đổi cùng với các biến số như mức tiêu thụ điện năng và sức mạnh xử lý, cùng với nhiều yếu tố khác. Sức mạnh xử lý hay còn được gọi là hash power. Các máy tính của miner tiêu thụ lượng sức mạnh này để tạo ra một Bitcoin block hash hợp lệ.

Khi sức mạnh hash của Bitcoin network tăng lên có nghĩa là tốn ít thời gian hơn để tạo ra 1 block. Vì vậy, để duy trì trung bình 1 block được tạo ra mỗi 10 phút, Bitcoin network sẽ thay đổi network target để làm cho miners khó có thể tìm ra block hash hợp lệ.

Với bitcoin, target khi block Bitcoin đầu tiên được tạo là:

```json
00000000ffff0000000000000000000000000000000000000000000000000000
```

Đây là giá trị cao nhất của target. Khi bạn so sánh hash của block đầu tiên với số trên thì có thể thấy nó bé hơn.

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| Initial target | 00000000ffff0000000000000000000000000000000000000000000000000000 |
| Block #0 hash  | 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f |

Một cách đơn giản để biết số nào bé hơn dưới cơ số hex là đếm bao nhiêu số 0 từ điểm bắt đầu của hash. Target ban đầu có 8 số 0 và Block #0 có 10 số 0 nên Block #0 có hash bé hơn ==> hợp lệ.

### Quá trình mining

Tại bất cứ thời điểm nào, hàng trăm ngàn miners trên Bitcoin network đang cạnh tranh để khám phá ra block hợp lệ tiếp theo. Miners được thưởng block reward và phí giao dịch.

**Contents of a valid Bitcoin block**

| Field          | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| Version        | The Bitcoin client version that the miner is currently using                       |
| hashPrevBlock  | The hash of the last block that the miner sees at this moment                      |
| hashMerkleRoot | The hash of all the transactions the miner decides to include in the current block |
| Time           | The block timestamp, calculated as seconds since 1970-01-01T00:00 UTC              |
| Bits           | The current Bitcoin network target                                                 |
| Nonce          | Starts at 0; if the resulting hash is not valid, then add 1 and try the new hash   |

Tất cả các trường ngoại trừ `Nonce` là thông tin được public. Khi một miner bắt đầu giải block mới, họ ban đầu set nonce là 0 và cố để tạo ra một hash trùng bới block hash - được tạo ra một cách ngẫu nhiên. Miners cố gắng tìm block hash này sử dụng hash power. Nếu kết quả là một block hash không hợp lệ, miner sẽ thêm 1 vào chuỗi số 32 bits(nonce) và tạo hash mới.

![image](/img/docs/blockchain/mabc_0218.png)

Sau khi miner tìm được block hash hợp lệ, miner này sẽ broadcasts block hash này đến toàn bộ các miners khác. Sẽ có khả năng là 2 miner cùng lúc tìm được và broadcast hash này lên network. Trường hợp này thì tùy thuộc vào các miners khác quyết định block nào sẽ được thêm vào blockchain.

![image](/img/docs/blockchain/mabc_0219.png)

Sự đồng thuận đạt được khi có hơn 50% miners trên network thêm cùng 1 block mới vào bản copy blockchain của họ.

Lưu ý: `longest chain rule` yêu cầu các miners phải theo chuỗi dài nhất. Nếu 2 versions của chuỗi có độ dài bằng nhau cùng lúc, trường hợp này thì nhóm tìm được block tiếp theo chậm hơn sẽ phải chuyển sang nhánh kia. Quy luật chuỗi dài nhất này là bản chất hình thành nên hầu hết các cơ chế đồng thuận, đặc biệt là proof-of-work.

## 10. Vòng đời của transaction

Trong một hệ thống thanh toán tập trung như PayPal chẳng hạn, vòng đời của 1 transaction khá trực quan. Bạn đăng nhập vào website hoặc app của PayPal, nhập các thông tin về transaction và nhấn Enter. Nếu PayPal responds với thông báo "hoàn thành" thì transaction của bạn đã được xử lý và mọi việc hoàn tất.

Vòng đời của transaction trong Bitcoin thì rất khác, có nhiều bước khác nhau trong quá trình xử lý.Có 4 giai đoạn chính mà 1 transaction sẽ trải qua:

1. _Broadcast_. Bước đầu tiên là tạo một bitcoin transaction hợp lệ và sau đó broadcast transaction đến mạng lưới Bitcoin. Hầu hết người dùng Bitcoin sẽ sử dụng một ví online (chăng hạn như Coinbase), và ở phía sau thì có phần mềm (client) kết nối với Bitcoin network cho phép chúng có thể nhìn thấy các transactions này.

2. _Unconfirmed/Mempool_. Vì tất cả miners đều nhận được transaction này, transaction sẽ được đặt vào memory pool hay `mempool`. Mempool là một bộ các bitcoin transactions đang ở trạng thái `unconfirmed` và vẫn được xem là `active`. Mặc định, nếu một transaction nằm trong mempool quá 2 tuần thì được xem là `inactive` và bị loại ra khỏi mempool.

3. _Confirmed by miner_. Khi một miner tìm ra block mới, miner sẽ quyết định transactions nào đưuọc thêm vào block đó, các blocks này được chọn từ mempool.Miners sẽ chọn transactions nào có fee cao trước. Một transaction được xem là được `confirmed` bởi một miner khi miner thêm một block chứa transaction đó vào blockchain. Tuy nhiên, miner không thể nhìn thấy các bản copies blockchain của các miners khác vì vậy sẽ không đảm bảo block chứa các transactions đó có được thêm vào chuỗi của họ hay không.

4. _Confirmed by the network_. Vì một block được lấp bởi các blocks mới hơn, khả năng mà Bitcoin network đạt được sự đồng thuận để thêm block đó tăng lên. Một transaction được confirmed bởi toàn bộ Bitcoin network khi network đã đạt được sự đồng thuận để thêm block chứa transaction đó vào blockchain.

## 11. Confirmations

Bitcoin wallets và hầu hết mọi người tỏng ngành công nghiệp này đều đánh giá một transaction là được confirmed một cách an toàn bởi network khi transaction đó đạt ít nhất 6 confirmations. Một confirmation liên quan đến miner thêm một block chứa transaction đó vào chuỗi.

![image](/img/docs/blockchain/mabc_0220.png)

Ở hình trên, block #100 đạt 3 confirmations. Tất cả 4 miners trên network đã thêm #100 vào chuỗi của mình. Tại block #101, 3/4(75%) miners đã thêm vào block được tìm ra bởi Bob, có 1 miner(D) đã thêm block được tìm ra bởi Charlie. Tại thời điểm này, miner D vẫn chưa nhận ra rằng mình phải thay đổi từ block #101, nếu có một transaction trong block #101 của miner D không nằm trong block #101 của các miner khác thì transaction đó sẽ không được thêm vào blockchain của network. Đây chính là lý do tại sao một transactions có càng nhiều confirmations thì khả năng càng cao transaction đó sẽ được thêm vào blockchain của network.

**Note**: Nhiều services có các lịch trình xác nhận tiền mã hóa khác nhau. Ví dụ, có một vài services yêu cầu ít nhất 3 Bitcoin network confirmations trước khi một transaction được xem là hoàn thành, mặc dù tiêu chuẩn là 6 confirmations. Cũng có một vài services yêu cầu hơn 6 confirmations.

## 12. Proof-of-stake

Là một thuật toán đồng thuận với mục tiêu là cải thiện proof-of-work bằng cách loại bỏ sự cần thiết của mining. Thay vào đó, những người nắm dữ cryptocurreny sẽ `stake` số tiền họ có để nhận lại quyền voting và có cơ hội được chọn bởi network để xác minh transactions. Staking vì vậy cho phép bạn hành động như một node hay một validator.

Mặc dù không cần các thiết bị phần cứng đắt đỏ hoặc các quá trình xử lý tính toán phức tạp, nó lại cần các yếu tố kinh tế, có các ưu đãi như những người tham gia stake sẽ nhận đưuọc phần thưởng tương ứng với số lượng họ stake.

**Note**: Trong một proof-of-stake network, các nodes không được xem là miners vì họ không thực hiện việc tìm ra một block. Mà thay vào đó, vai trò của các nodes trong network là validate transactions, cho nên các nodes trong network được gọi là các validators.

Thay vì chọn miner tìm ra block hợp lệ đầu tiên, proof-of-stake chọn một node dựa vào một số tiêu chí staking trong đó có thể bao gồm kích thước stake (số lượng đã staked), age(những địa chỉ nắm giữ cryptocurrency trong thời gian dài nhất), wealth(những địa chỉ nắm giữ lượng tiền mã hóa lớn nhất), etc. Một cách thay thế, trong một vài hệ thống, một địa chỉ đã staked sẽ được chọn random.

Ưu điểm:

- Bởi vì không cần mining, ít năng lượng tiêu thụ hơn để tạo ra blocks cho nên ít năng lượng bị lãng phí hơn.
- Trao nhiều quyền kiểm soát hơn cho những người đầu tư vào network nhiều hơn.

Nhược điểm:

- Sự điều khiển mạng lưới gắn liền với sự phân bố giàu có trên mạng lưới. Hầu hết thì số này nằm trong 1 nhóm nhỏ, vì vậy thì sự điều khiển của mạng lưới sẽ thuộc dạng tập trung hơn so với proof-of-work.
- Bằng cách trao quyền kiểm soát nhiều hơn cho những người đầu tư nhiều hơn vào network hơn là những người thực sự làm nhiều việc hơn, proof-of-stake có thể nhẫn tới sự giãn cách giàu nghèo hơn so với proof-of-work.

Đã từng có rất nhiều chỉ trích về model proof-of-work. Mặc dù là một ý tưởng mới lạ cho cryptocurrency khi Satoshi Nakamoto đề xuất, các phần cứng được phát triển cho việc đào coin lại nhiều hơn mức cần thiết. Một mặt nó nói lên Bitcoin là một vấn đề của môi trường vì lượng điện cần tiêu thụ để confirm transactions và tạo ra block mới không còn hiệu quả về mặt kinh tế. Mặt khac snos chỉ ra rằng lượng điện tiêu thụ nhiều nhất cho Bitcoin lại là các năng lượng tái tạo như thủy điện.

Một số đồng như Dash, Neo, Tezos sử dụng proof-of-stake nhưng nó là một khái niệm khá mới và chưa được sử dụng rộng rãi như proof-of-work. Đã có nhiều chỉ trích nằng POS là một cơ chế đồng thuận bảo mật kém, vì một `fork` trên thực tế có thể tạo nên khuyến khích bình đăng trên 2 chuỗi khác nhau. Và cũng tồn tại kiểu tấn công `fake stake` khi mà một staker với ít hoặc hoàn toàn không sở hữu crypto có thể phá hoạt toàn bộ network, vì cơ chế xác thực trong POS phức tạp hơn nhiều sơ với POW.

Ngoài POW và POS thì còn có một số khái niệm khác chẳng hạn như `Byzantine agreement` mà Ripple và Stellar sở dụng, cơ chế này sẽ sử dụng nhiều nodes kết hợp để confirm transactions trong đó có nhiều nodes đưuọc điều khiển bởi chính dự án sử dụng. Cũng chính vì điều này mà nó được xem là tập trung chứ không phải phi tập trung.

Một số phương pháp khác nữa chẳng hạn proof-of-storage, proof-of-history, voting-based, lottery-based.
