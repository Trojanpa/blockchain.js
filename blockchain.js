// 注意：仅用于说明区块链原理，不完整，不安全

// 1.js实现一个基本的区块链
// 2.实现POW
// 3.交易与挖矿奖励

const SHA256 = require('crypto-js/sha256');

// 区块类
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.previousHash = previousHash; // 前一个区块的hash
    this.timestamp = timestamp; // 时间戳
    this.transactions = transactions; // 需要在区块里存储的一些交易数据
    this.hash = this.calculateHash(); // 每个区块都包含的一个基于其内容计算出来的hash
    this.nonce = 0; // 用于查找一个有效Hash的次数
  }
  // 计算hash
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }
  // 挖矿。增加Nonce，直到获得一个有效hash。这由难度决定的。所以我们会收到作为参数的难度
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    // 寻找到一个有效的hash（创建一个新的区块）在圈内称之为挖矿。
    console.log('BLOCK MINED: ' + this.hash);
  }
}

// 区块链类
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]; // 区块链
    this.difficulty = 5; // 区块链难度。将它设置为5（这意味着区块的hash必须以5个0开头）.如果你创建了一个难度为5的区块链实例，你会发现你的电脑会花费大概十秒钟来挖矿。随着难度的提升，你的防御攻击的保护程度越高。
    this.pendingTransactions = []; // 存储待处理的交易
    this.miningReward = 100; // 挖矿回报
  }
  // 创建创世块
  createGenesisBlock() {
    return new Block(Date.now(), [], '0');
  }
  // 获取最新块
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }
  // 创建交易
  createTransaction(transaction) {
    // 这里应该有一些校验!
    // 推入待处理交易数组
    this.pendingTransactions.push(transaction);
  }
  // 挖掘所有待交易的新区块，且向采矿者发送奖励
  minePendingTransactions(miningRewardAddress) {
    // 用所有待交易来创建新的区块，并且开挖..
    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    // POW是通过一定数量的计算来防止区块被滥用。通过要求hash以特定数目的0来实现POW，这也被称之为难度。
    block.mineBlock(this.difficulty);

    // 将新挖的看矿加入到链上
    this.chain.push(block);

    // 重置待处理交易列表并且发送奖励给挖矿的地址
    this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
  }
  // 获取我们区块链上地址的余额
  getBalanceOfAddress(address) {
    let balance = 0; // 余额从0开始
    // 遍历每个区块以及每个区块内的交易
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        // 如果地址是发起方 -> 减少余额
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        // 如果地址是接收方 -> 增加余额
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }
  // 遍历所有的区块来检查每个区块的hash是否正确，确保没有人篡改过区块链。它会通过比较previousHash来检查每个区块是否指向正确的上一个区块。如果一切都没有问题它会返回true否则会返回false。
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// 交易类
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress; // 发起方
    this.toAddress = toAddress; // 接收方
    this.amount = amount; // 数量
  }
}

// 使用区块链
// 创建区块链实例
const savjeeCoin = new Blockchain();

// 创建了一些交易
console.log('创建了一些交易...');
savjeeCoin.createTransaction(new Transaction('address1', 'address2', 100));
savjeeCoin.createTransaction(new Transaction('address2', 'address1', 50));

// 检查一下账户余额：（上面只是创建了交易，交易双方交易后的余额会在下次挖矿时更新，而挖矿者的奖励会添加为新的待处理交易）
console.log('交易发起方 address1 的余额：', savjeeCoin.getBalanceOfAddress('address1'));
console.log('交易接收方 address2 的余额：', savjeeCoin.getBalanceOfAddress('address2'));
console.log('矿工 xaviers-address 的余额：', savjeeCoin.getBalanceOfAddress('xaviers-address'));

// 这些交易目前都处于等待状态，为了让他们得到证实，我们必须开始挖矿：
console.log('开始挖矿...');
savjeeCoin.minePendingTransactions('xaviers-address');

// 检查一下账户余额：(挖矿奖励添加为新的待处理交易。这笔交易将会包含在下一个区块中。所以如果我们再次开始挖矿，我们将收到我们的100枚硬币奖励。)
console.log('交易发起方 address1 的余额：', savjeeCoin.getBalanceOfAddress('address1'));
console.log('交易接收方 address2 的余额：', savjeeCoin.getBalanceOfAddress('address2'));
console.log('矿工 xaviers-address 的余额：', savjeeCoin.getBalanceOfAddress('xaviers-address'));

// 继续挖矿
console.log('Starting the miner again!');
savjeeCoin.minePendingTransactions('xaviers-address');

// 检查一下账户余额：
console.log('交易发起方 address1 的余额：', savjeeCoin.getBalanceOfAddress('address1'));
console.log('交易接收方 address2 的余额：', savjeeCoin.getBalanceOfAddress('address2'));
console.log('矿工 xaviers-address 的余额：', savjeeCoin.getBalanceOfAddress('xaviers-address'));

// 检查是否有效(将会返回true)
// console.log('Blockchain valid? ' + savjeeCoin.isChainValid());

// 现在尝试操作变更数据
// savjeeCoin.chain[1].transactions = { amount: 100 };

// 再次检查是否有效 (将会返回false)
// console.log('Blockchain valid? ' + savjeeCoin.isChainValid());
