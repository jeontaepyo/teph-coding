const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', () => {
  numbersContainer.innerHTML = '';
  const lottoNumbers = new Set();
  while (lottoNumbers.size < 6) {
    lottoNumbers.add(Math.floor(Math.random() * 45) + 1);
  }

  const sortedNumbers = Array.from(lottoNumbers).sort((a, b) => a - b);

  sortedNumbers.forEach(number => {
    const numberDiv = document.createElement('div');
    numberDiv.classList.add('number');
    numberDiv.textContent = number;
    numbersContainer.appendChild(numberDiv);
  });
});