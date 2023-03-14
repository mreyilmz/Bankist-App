"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

// Global variable kullanmak yerine functionlarla çalışmak daha iyi
// Hesap hareketlerini yansıtan fonksiyon. Yeniden eskiye
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  // Kullanıcı
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//////////////////////////////////////////////////////////////////

//////////////////////// Reduce method //////////////////
// Hareketleri toplayıp balance etiketine yansıtan fonksiyon
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance} €`;
};

/////////////////////////////////////////////////////////////////////

// Gelen ve giden hareketleri gösteren fonksiyon
const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, deposit) => acc + deposit, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, out) => acc + out, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

////////////////////////////////////////////////////////////////

// accs = accounts array
// accountlarda username adında yeni bir property oluşturduk
const createsUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createsUsernames(accounts);
/////////////////////////////////////////////////////////////////////

////////////////////Event Handler//////////////////////////
// Kullanıcı adı ve soyadı doğrulanırsa kullanıcı hareketlerini görebilir
let currentAccount;
btnLogin.addEventListener("click", function (e) {
  //Prevent form from submitting and page does not reload
  e.preventDefault();
  sorted = false;
  // username inputuna bakarak current accountu bilicez
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(" ")[0]
    }`;
    // Kullanıcı giriş yaptığında areketleri gösterir
    containerApp.style.opacity = "100";
    // Kullanıcı adı ve şifresini formdan kaldırır.
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    // imleç fokusunu pin inputtan kaldırır.
    inputLoginPin.blur();
    // Update UI
    updateUI(currentAccount);
  }
});
///////////////////////////////////////////////////////////////////

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferAmount.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      (account) => account.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Account has been deleted";
    console.log(index, "deleted");
  }
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

function updateUI(account) {
  // Display movements
  displayMovements(account.movements);
  // Display balance
  calcDisplayBalance(account);
  // Display summary
  calcDisplaySummary(account);
}

//////////////////////////// Coding Challange 1 ///////////////////////////
const julia1 = [3, 5, 2, 12, 7];
const kate1 = [4, 1, 15, 8, 3];
const julia2 = [9, 16, 6, 8, 3];
const kate2 = [10, 5, 6, 1, 4];

const checkDogs = function (dogsJulia, dogsKate) {
  const correctJulia = [...dogsJulia];
  correctJulia.splice(3, 2);
  correctJulia.splice(0, 1);
  const allDogs = correctJulia.concat(dogsKate);

  allDogs.forEach(function (dogAge, number) {
    if (dogAge < 3) console.log(`Dog number ${number} is still a puppy`);
    else
      console.log(
        `Dog number ${number} is an adult, and is ${dogAge} years old.`
      );
  });
};
//checkDogs(julia1, kate1);
//checkDogs(julia2, kate2);

//////////////////////////// Coding Challange 2 ///////////////////////////
const data1 = [5, 2, 4, 1, 15, 8, 3];
const data2 = [16, 6, 10, 5, 6, 1, 4];

const calcAverageHumanAge = function (array) {
  const humanAge = array.map((dogAge, i) =>
    dogAge <= 2 ? dogAge * 2 : 16 + dogAge * 4
  );
  const moreThan18 = humanAge.filter((age) => age >= 18);

  // Ortalama hesaplamanın ilk methodu
  const averageAge = moreThan18.reduce(function (acc, curr, i, array) {
    return acc + curr / array.length;
  }, 0);

  // Ortalama hesaplamanın ikinci methodu
  /*   const averageAge = moreThan18.reduce(function (acc, curr, i) {
    return acc + curr;
  }, 0) / moreThan18.length; */
  return averageAge;
};
//const average1 = calcAverageHumanAge(data1);
//const average2 = calcAverageHumanAge(data2);
//console.log(average1, average2);

//////////////////////////// Coding Challange 3 ///////////////////////////
const calcAverageHumanAge2 = (array) => {
  const humanAge = array
    .map((dogAge, i) => (dogAge <= 2 ? dogAge * 2 : 16 + dogAge * 4))
    .filter((age) => age >= 18)
    .reduce((acc, curr, i, array) => acc + curr / array.length, 0);
  return humanAge;
};
const average3 = calcAverageHumanAge2(data1);
const average4 = calcAverageHumanAge2(data2);
//console.log(average3, average4);
/////////////////////////////////////////////////////////////////////////

//////////////////////////// Coding Challange 4 ///////////////////////////
const dogs = [
  { weight: 22, curFood: 250, owners: ["Alice", "Bob"] },
  { weight: 8, curFood: 200, owners: ["Matilda"] },
  { weight: 13, curFood: 275, owners: ["Sarah", "John"] },
  { weight: 32, curFood: 340, owners: ["Michael"] },
];

///////////task1////////////////
dogs.forEach(function (dog, i, arr) {
  dog.recommendedFood = dog.weight ** 0.75 * 28;
});
console.log(dogs);

///////////task2////////////////
dogs.forEach(function (dog, i) {
  const cond = dog.owners.includes("Sarah");
  if (cond === true) {
    console.log(dogs[i]);
  }
});

///////////task3////////////////
const ownersEatTooMuch = dogs.filter(
  (dog) => dog.curFood > dog.recommendedFood * 1.1
);

const ownersEatTooLittle = dogs.filter(
  (dog) => dog.curFood < dog.recommendedFood * 0.9
);

///////////task4////////////////
const ownersMuch = [];
ownersEatTooMuch.forEach(function (dog) {
  ownersMuch.push(dog.owners);
  const owner = ownersMuch.flat().join(" and ");
  console.log(`${owner}'s dogs eat too much`);
});

const ownersLittle = [];
ownersEatTooLittle.forEach(function (dog) {
  ownersLittle.push(dog.owners);
  const owner = ownersLittle.flat().join(" and ");
  console.log(`${owner}'s dogs eat too little`);
});

///////////task5////////////////
console.log(dogs.some((dog) => dog.curFood === dog.recommendedFood));

///////////task6////////////////
console.log(
  dogs.some(
    (dog) =>
      dog.curFood < dog.recommendedFood * 1.1 &&
      dog.curFood > dog.recommendedFood * 0.9
  )
);

///////////task7////////////////
const okayAmountFoodDog = dogs.find(
  (dog) =>
    dog.curFood < dog.recommendedFood * 1.1 &&
    dog.curFood > dog.recommendedFood * 0.9
);
console.log(okayAmountFoodDog);

///////////task8////////////////
const sortedDogs = dogs.slice();
sortedDogs.sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(sortedDogs);
