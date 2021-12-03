# Solidity Cơ bản

## 1. Making Zombie Factory

### Contracts

```go
pragma solidity >=0.5.0 <0.6.0;

contract ZombieFactory {}
```

### State Variables & Integers

```go
uint dnaDigits = 16;
```

### Math operations

```go
uint dnaModulus = 10 ** dnaDigits;
```

### Structs

```go
struct Zombie {
  string name;
  uint dna;
}
```

### Arrays

```go
Zombie[] public zombies;
```

### Function

```go
function _generateRandomDna(string memory _str) private view returns (uint) {
  uint rand = uint(keccak256(abi.encodePacked(_str)));
  return rand % dnaModulus;
}
```

### Keccak256 and Typecasting

```go
uint rand = uint(keccak256(abi.encodePacked(_str)));
```

### Event

```go
event NewZombie(uint zombieId, string name, uint dna);
emit NewZombie(id, _name, _dna);
```

## 2. Zombies Attack Their Victims

### Mappings

```go
// for a financial app, storing a uint that holds the user's account balance:
mapping (address => uint) public accountBalance;

// Or could be used to store / lookup usernames based on userId:
mapping (uint => string) userIdToName;
```

### Interacting with other contracts

For our contract to talk to another contract on blockchain that we don't own, first we need to define an `interface`.

```go
contract KittyInterface {
  function getKitty(uint256 _id) external view returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  );
}
```

### Using an Interface

```go
address ckAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
KittyInterface kittyContract = KittyInterface(ckAddress);
```

## 3. Advanced solidity concepts

Cho đén hiện tại thì `solidity` nhìn khá giống so với các ngôn ngữ khác chẳng hạn như `javascript`. Nhưng có một số chỗ mà Ethereum DApps khác so với các app thông thường.

- Sau khi deploy một contract đến Ethereum thì nó `immutable`, nghĩa là không bao giờ có thể sửa đổi hay update.
- Code ban đầu mà bạn deploy sẽ ở đó vĩnh viễn trên blockchain. Đây là một lý do mà bảo mật là một vấn đề sống còn trong Solidity. Nếu có một lỗi trong contract code thì không có cách nào để patch. Bạn sẽ phải bảo với user sử dụng một địa chỉ smart contract khác đã fix lỗi đấy.
- Nhưng đây cũng là một tính năng của smart contracts. Nếu bạn đọc code của một smart contract và verify nó, bạn có thể chắc chắn rằng mỗi lần bạn gọi một function nó sẽ làm điều chính xác mà bạn muốn. Không ai có thể thay đổi function đó khiến bạn nhận kết quả không mong muốn.

- Ở các phần trên thì ta hardcode địa chỉ smart contract của CryptoKitties, nhưng nếu chẳng may contract đó có bug và tiêu hủy toàn bộ kitties ? DApps của chúng ta sẽ trở nên vô dụng vì không thể có kitties để feed cho zombie, chúng ta cũng không thể update được contract. chính vì vậy mà thay vì hardcode thì chúng ta sẽ có functions cho phép update cái key này.

```go
KittyInterface kittyContract;
function setKittyContractAddress(address _address) external {
  kittyContract = KittyInterface(_address);
}
```

### Ownable Contracts

Ở phía trên thì ta sử dụng `external` cho function `setKittyContractAddress`, điều này sẽ gây nên vấn đề về bảo mật vì ai cũng có thể sử dụng hàm này. Dưới đây ta sẽ học về khái niệm `modifier` - nó kiểu như 1 dạng middleware để authorize trước khi function được thực hiện.

```go
// ownable.sol
pragma solidity >=0.5.0 <0.6.0;

/**
* @title Ownable
* @dev The Ownable contract has an owner address, and provides basic authorization control
* functions, this simplifies the implementation of "user permissions".
*/
contract Ownable {
  address private _owner;

  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  /**
  * @dev The Ownable constructor sets the original `owner` of the contract to the sender
  * account.
  */
  constructor() internal {
    _owner = msg.sender;
    emit OwnershipTransferred(address(0), _owner);
  }

  /**
  * @return the address of the owner.
  */
  function owner() public view returns(address) {
    return _owner;
  }

  /**
  * @dev Throws if called by any account other than the owner.
  */
  modifier onlyOwner() {
    require(isOwner());
    _;
  }

  /**
  * @return true if `msg.sender` is the owner of the contract.
  */
  function isOwner() public view returns(bool) {
    return msg.sender == _owner;
  }

  /**
  * @dev Allows the current owner to relinquish control of the contract.
  * @notice Renouncing to ownership will leave the contract without an owner.
  * It will not be possible to call the functions with the `onlyOwner`
  * modifier anymore.
  */
  function renounceOwnership() public onlyOwner {
    emit OwnershipTransferred(_owner, address(0));
    _owner = address(0);
  }

  /**
  * @dev Allows the current owner to transfer control of the contract to a newOwner.
  * @param newOwner The address to transfer ownership to.
  */
  function transferOwnership(address newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  /**
  * @dev Transfers control of the contract to a newOwner.
  * @param newOwner The address to transfer ownership to.
  */
  function _transferOwnership(address newOwner) internal {
    require(newOwner != address(0));
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}
```

Bây giờ thì apply `onlyOwner` cho `setKittyContractAddress` thôi.

```go
function setKittyContractAddress(address _address) external onlyOwner {
  kittyContract = KittyInterface(_address);
}
```

### Gas - the fuel Ethereum DApps run on

Tuyệt, bây giờ thì ta đã biết cách để update key cho DApp và chặn users khác làm tổn hại đến contracts của chúng ta.

Bây giờ hãy xem 1 điểm khác nữa của Solidity so với các ngôn ngữ lập trình khác - Gas.

Trong Solidity, users của bạn phải trả một khoản phí để thực hiện một function trên DApps của bạn sử dụng một tiền tệ được gọi là gas.

Số lượng gas yêu cầu để thực hiện một function thì còn tùy thuộc và độ phức tạp của logic trong function. Mỗi mội operation có một phí gas dựa vào bao nhiêu tài nguyên tính toán yêu cầu để thực hiện operation đó (ví dụ như ghi vào ổ đĩa thì sẽ tốn nhiều hơn thực hiện phép cộng 2 số). Tổng phí gas để thực hiện function là tổng gas để thực hiện tất cả các operations con.

Vì chạy các function thì tiêu tốn tiền thật của users, tối ưu code đặc biệt quan trọng trong Solidity so với các ngôn ngữ lập trình khác.

#### Tại sao gas lại cần thiết

Ethereum là một cỗ máy lớn, chậm nhưng cực kỳ bảo mật. Khi bạn thực thi một function, mỗi 1 node trên mạng lưới cần chạy cùng 1 function đó để verify output của nó - hàng ngàn nodes thực hiện verify là điều làm cho Ethereum phi tập trung và dữ liệu của nó không thể bị thay đổi.

Những nhà sáng lập ra Ethereum muốn đảm bảo rằng một người không thể làm tắc nghẽn cả mạng lưới với 1 vòng lặp vô tận, hay lấy đi tất cả các tài nguyên của mạng lưới những siêu máy tính cực khủng. Cho nên họ làm cho những transactions không miễn phí.

Điều ở trên không nhất thiết đúng với các blockchain khác, chẳng hạn như Loom Network. Sẽ không thích hợp nếu chạy một game như WW trên Ethereum mainnet - chi phí tính toán quá cao.

#### struct packing to save pas

Thông thường thì sẽ không có lợi ích nào khi sử dụng các sub-types khác của Solidity như `uint8`, `uint16`,... vì Solodity sẽ vẫn dữ sử dụng 256bits. Sử dụng uint8 thay vì uint256 sẽ không giúp bạn giảm chi phí gas.

Tuy nhiên có một ngoại lệ là trong `struct`.

```go
struct NormalStruct {
  uint a;
  uint b;
  uint c;
}

struct MiniMe {
  uint32 a;
  uint32 b;
  uint c;
}

// `mini` will cost less gas than `normal` because of struct packing
NormalStruct normal = NormalStruct(10, 20, 30);
MiniMe mini = MiniMe(10, 20, 30);
```

### Passing structs as arguments

```go
function _triggerCooldown(Zombie storage _zombie) internal {
  _zombie.readyTime = uint32(now + cooldownTime);
}

function _isReady(Zombie storage _zombie) internal view returns (bool) {
    return (_zombie.readyTime <= now);
}
```

### More on Funciton Modifiers

```go
modifier aboveLevel(uint _level, uint _zombieId) {
  require(zombies[_zombieId].level >= _level);
  _;
}
```

### Saving Gas With 'View' Functions

- `view` functions không tiêu tốn chi phí as khi chúng được gọi bởi 1 user.

- Vì `view` functions không thực sự thay đổi gì trên blockchain - chúng chỉ đọc dữ liệu. Cho nên việc đánh dấu một function là `view` nói cho `web3.js` rằng nó chỉ cần query local Ethererum node để chạy function đó và nó không thực sự tạo một transaction trên blockchain (cần chạy trên tất cả các nodes).

- Một trong những operations đắt đỏ trong Solidity là sử dụng `storage` - cụ thể là operation writes.

- Vì mỗi khi bạn ghi hay thay đổi một mảnh thông tin, nó sẽ được ghi lại vĩnh viễn trên blockchain. Vĩnh viễn! Hàng ngàn nodes khắp thế giới cần để lưu dữ liệu đấy trên ổ cứng của chúng, và mảnh thông tin này ngày càng tăng.

- Để giảm thiểu chi phí, bạn sẽ muốn tránh việc ghi dữ liệu trừ khi cực kỳ cần thiết. ĐÔi khi điều này có vẻ như không logic lắm trong lập - chẳng hạn như build lại một array mỗi lần một function đưuọc ogij thay vì đơn giản là lưu array mới trong một biến để có thể tìm kiếm nhanh hơn.

- Trong hầu hết các ngôn ngữ lập trình, việc lặp qua một data set lớn rất là tốn kém. Nhưng trong Solidity, việc này rẻ hơn nhiều so với sử dụng `storage` nếu nó trong một `external view` function, vì `view` functions không tiêu tốn bất cứ chi phí gas nào.

#### Khai báo arrays in memory

- Có thể sử dụng `memory`với arrays để tạo một array mới trong function mà không cần ghi bất cứ thứ gì đến storage. Array này sẽ chỉ tồn tại trong function và sẽ rẻ hơn rất nhiều so với việc update một array trong `storage`.

```go
uint[] memory values = new uint[](3);

// Put some values to it
values[0] = 1;
values[1] = 2;
values[2] = 3;
```

### For Loops

Ở phía trên thì ta sử dụng `.push` để thêm zombie vừa tạo vào mảng zombies của Owner.

#### Vấn đề với cách tiếp cận này.

Cách tiếp cận này thực sự rất đơn giản. Tuy nhiên hãy nhìn vào chuyện gì xảy ra nếu sau đó ta thêm một function để transfer một zombie từ mộ owner đến một owner khác.

Transacfer đó sẽ cần:

- 1. Push zombie đến array zombies của owner mới.
- 2. Remove zombie của owner hiện tại.
- 3. Shift các zombie của owner cũ.
- 4. Giảm length xuống 1.

Step 3 sẽ tốn cực kỳ nhiều chi phí gas, vì chúng ta phải thực hiện phép ghi cho mỗi zombie cần được shifted. Chẳng hạn nếu owner có 20 zombies và muốn bán zombie đầu tiên, chúng ta sẽ phải thực hiện 19 phép write để duy trì được thứ tự của array.

Vì việc ghi lên storage là cực kỳ tốn kém trong Solidity, mỗi lần gọi transfer function sẽ cực kỳ tốn gas. Tồi tệ hơn, mỗi lần gọi sẽ tốn một lượng gas khác nhau.

Chú ý; Tất nhiên, chúng ta có thể chỉ việc di chuyển zombie cuối của array đến slot của zombie vừa được trade và giảm length xuống 1. Nhưng nó sẽ thay đổi vị trí các zombie mỗi lần trade.

Vì `view` functions không tốn chi phí gas khi gọi `externally`, chúng ta đơn giản sẽ sử dụng for-loop.

```go
function getZombiesByOwner(address _owner) external view returns(uint[] memory) {
  uint[] memory result = new uint[](ownerZombieCount[_owner]);
  uint counter = 0;
  for (uint i = 0; i < zombies.length; i++) {
    if (zombieToOwner[i] == _owner) {
      result[counter] = i;
      counter++;
    }
  }
  return result;
}
```

## 4. Zombie Battle System

### Payable

Cho đến hiện tại, ta đã làm quen với một số `funciton modifiers`:

1. Chúng ta có các visibility modifiers để control khi nào vào ở đâu function có thể được gọi. `private` tức là chỉ có thể gọi từ các funcitons trong contract. `internal` tương tự như `private` tuy nhiên có thể được gọi từ các contracts khác kế thừa contract này. `external` chỉ có thể được gọi ngoài contract. `public` có thể được gọi bất cứ ở đâu.
2. State modifiers cho chúng ta biết cách mà function tương tác với blockchain. `view` tức là nếu chạy function thì không có bất cứ data nào sẽ được lưu, thay đổi. `pure` không ghi, thay đổi data cũng không đọc data từ blockchain. Cả 2 loại này không tốn gas nếu được gọi từ ngoài contract (có thể tốn gas nếu được gọi internally bởi functions khác).
3. custom modifiers chẳng hạn như `onlyOwner` hay `aboveLevel` giúp định nghĩa các custom logic quyết định ảnh hưởng thế nào đến function.

Có thể stack lên 1 funciton như sau:

```go
function test() external view onlyOwner anotherModifier { /* ... */ }
```

`payable` functions là một phần làm cho Solidity và Ethereum ngầu 😄 - là một function đặc biệt có thể nhận Ether.

- Khi bạn gọi API từ một web server thông thường, bạn không thể gửi US dollars(hay Bitcoin) cùng với function. Nhưng trong Ethereum, bởi vì cả tiền (Ether), dữ liệu(transaction payload) và contract code tất cả đều ở trên Ethereum. Tức là có thể gọi 1 function và trả 1 số tiền đến contract cùng lúc.

- Điều này cho phép một vài logic rất thú ví chẳng hạn yêu cầu một lượng tiền để có thể thực hiện một funciton. Ví dụ:

```go
contract OnlineStore {
  function buySomething() external payable {
    // Check to make sure 0.001 ether was sent to the function call:
    require(msg.value == 0.001 ether);
    // If so, some logic to transfer the digital item to the caller of the function:
    transferThing(msg.sender);
  }
}
```

Gọi từ front-end

```javascript
// Assuming `OnlineStore` points to your contract on Ethereum:
OnlineStore.buySomething({
  from: web3.eth.defaultAccount,
  value: web3.utils.toWei(0.001),
});
```

### Withdraws

```go
contract GetPaid is Ownable {
  function withdraw() external onlyOwner {
    address payable _owner = address(uint160(owner()));
    _owner.transfer(address(this).balance);
  }
}
```

### Random Numbers

#### Random number generation via `keccak256`

Chúng ta có thể làm như sau để generate random number:

```go
// Generate a random number between 1 and 100:
uint randNonce = 0;
uint random = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 100;
randNonce++;
uint random2 = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 100;
```

Phương pháp này dễ bị tấn công bởi các node không trung thực trên network.

Trong Ethereum, khi bạn gọi một function trên một contract, bạn sẽ broadcast nó tới một hay nhiều node trên network như một `transaction`. Nodes trên network sẽ thu thập nhiều transactions, cố để là node đầu tiên giải thành công một bài toán cực kỳ tốn kém chẳng hạn như `Proof of Work`, sau đó sẽ publish một nhóm các transactions cùng với `PoW` như một block đến phần còn lại của network.

Khi một node đã giải được `PoW`, các nodes khác sẽ ngừng giải, verify danh sách các transcations của các nodes khác là valid ==> accept block và giải block tiếp theo. Điều này làm cho hàm random number của chúng ta có thể bị khai thác.

Ví dụ chúng ta có một contract về lật coin - ngửa sẽ gấp đôi số tiền và úp sẽ mất hết, sử dụng funciton random phía trên để quyết định úp hay ngửa. Nếu mình đang chạy 1 node, mình có thể publish một transaction tới chỉ node của mình và không chia sẻ nó. Sau đó mình có thể chạy hàm flip coin để xem mình có thắng không, nếu thua mình sẽ không ghi transcation đó vào block và ngược lại. Mình có thể làm như thế vô hạn lần và thu lợi nhuận.

#### Làm sao có thể generate randome numbers một cách an toàn trên Ethereum ?

Bởi vì toàn bộ nội dung của blockchain đề có thể nhìn thấy bởi tất cả những người tham gia, đây sẽ là một vấn đề khó. Đọc thêm ở [đây](https://ethereum.stackexchange.com/questions/191/how-can-i-securely-generate-a-random-number-in-my-smart-contract).

Tất nhiên, vì hàng trăm ngàn nodes trên Ethereum network đang cạnh tranh để có thể giải block tiếp theo, khả năng mình có thể giải block tiếp theo cực kỳ thấp. Sẽ tốn rất nhiều thời gian và tài nguyên tính toán để có thể khai thác - nhưng nếu phần thưởng đủ nhiều (chẳng hạn như $100.000.000) thì sẽ đáng để tấn công.

Vậy thì trong khi hàm này không bảo mật trên Ethereum, trên thực tế trừ khi random function của chúng ta ảnh hưởng đến rất nhiều tiền, users trong game của chúng ta sẽ không có đủ tài nguyên để tấn công.

Vì đây chỉ là một tutorial không dính dáng gì đến tiền thật nên ta vẫn sẽ sử dụng hàm trên cho đơn giản mặc dù biết nó không bảo mật.

```go
uint randNonce = 0;

function randMod(uint _modulus) internal returns(uint) {
  randNonce++;
  return uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % _modulus;
}
```

## 5. ERC721 & Crypto Collectibles

### Tokens on Ethereum

Một `token` trên Ethereum đơn giản là một smart contract tuân theo một số rules - triển khai một số functions tiêu chuẩn mà các token contracts đều có chẳng hạn `transferFrom(address _from, address _to, uint256 _tokenId)` và `balanceOf(address _owner)`.

Một cách nội bộ, smart contract luôn có một mapping, `mapping(address => uint256) balances` để theo dõi mỗi address có bao nhiêu trong balance.

Vậy đơn giản thì mỗi token chỉ là một contract mà theo dõi ai sở hữu bao nhiêu token đó, cùng với một số functions để users có thể chuyển tokens của họ đến địa chỉ khác.

#### Tại sao nó quan trọng ?

Vì tất cả ERC20 tokens đều chia sẻ cùng một bộ functions với cùng tên, chúng đều có thể tương tác với nhau cùng cách thức.

Có nghĩa là nếu bạn build một app có khả năng tương tác với 1 ERC20 token, nó cũng có thể tương tác với bất cứ ERC20 tokens nào. Bằng cách đó thì nhiều tokens có thể dễ dàng được thêm vào app của bạn trong tương lai mà không cần phải custom code. Bạn có thể đơn giản thêm token contract address và app của bạn đã có thêm một token khác có thể sử dụng.

Một ví dụ là sàn giao dịch. Khi một sàn giao dịch thêm một ERC20 token, thì thực chất chỉ cần thêm một smart contract để nó có thể giao tiếp. Users có thể dùng contract kia để chuyển tokens đến địa chỉ ví của sàn, và sàn có thể dùng contract để gửi tokens lại cho user khi chúng nhận được withdraw request.

Sàn chỉ cần triển khai transfer logic 1 lần, và khi nó muốn thêm một ERC20 token mới, chỉ đơn giản là thêm 1 contract address vào database.

#### Một số token khác

Các ERC20 tokens thực sự rất ngầu cho việc sử dụng như tiền tệ. Nhưng chúng không thực sự hữu dụng cho việc đại diện zombie trong game của chúng ta.

Về một mặt, zombies không thể chia nhỏ như currencies - Mình có thể gửi cho bạn 0.238 ETH nhưng không thể gửi 0.238 zombie.

Thứ hai, tất cả zombies đều không giống nhau. Zombie level 2 "Steve" của bạn không thể bằng zombie level 328 "EIUF3EF346 MORS" của tôi.

Có một chuẩn khác thích hợp hơn cho crypto-collectibles là ERC721 tokens.

Các ERC721 tokens không thể hoán đổi cho nhau vì mỗi token được xem là độc nhất, và không thể chia nhỏ. Bạn chỉ có thể trao đổi như 1 unit hoàn chỉnh, và mỗi token đều có 1 unique ID, hoàn toàn phù hợp với game của chúng ta.

### ERC721

```go
contract ERC721 {
  event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
  event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

  function balanceOf(address _owner) external view returns (uint256);
  function ownerOf(uint256 _tokenId) external view returns (address);
  function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
  function approve(address _approved, uint256 _tokenId) external payable;
}
```

### Transfer Logic

- `function transferFrom(address _from, address _to, uint256 _tokenId) external payable`: người sở hữu token sẽ gọi `transferFrom` với địa chỉ là `address` là `_from` và `address` anh ta muốn transfer đến là `_to`, `_tokenId` là token muốn transfer.
- `function approve(address _approved, uint256 _tokenId) external payable`: người sở hữu token sẽ gọi `approve` với địa chỉ muốn transfer đến và `_tokenId`. Contract sau đó lưu lại người đã approved, sau đó owner hoặc địa chỉ đã được approved sẽ gọi `transferFrom`, contract kiểm tra nếu `msg.sender` là owner hoặc được approved bởi owner thì transfer nó cho người nhận.

```go
function _transfer(address _from, address _to, uint256 _tokenId) private {
  ownerZombieCount[_to]++;
  ownerZombieCount[_from]--;
  zombieToOwner[_tokenId] = _to;
  emit Transfer(_from, _to, _tokenId);
}
```

### Preventing overflows

- Giả sử chúng ta có một `uint8` có 8bits, có nghĩa là số lớn nhất chúng ta có thể lưu là 255. Vậy điều gì sẽ xảy ra nếu chúng ta `++` lên biến đó.
- Trường hợp này thì chúng ta đã gây ra overflow - từ 111111111 bị reversed back to 00000000.
- Tương tự thì underflow là từ 0 chúng ta `--` sẽ reversed back to 255.
- Đó là lý do chúng ta không sử dụng uint8;

#### SafeMath

- Để ngăn chạn overflow thì OpenZeppelin đã tạo ra 1 library gọi là SafeMath.

```go
using SafeMath for uint256;

uint256 a = 5;
uint256 b = a.add(3); // 5 + 3 = 8
uint256 c = a.mul(2); // 5 * 2 = 10
```
