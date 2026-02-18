const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');
const themeToggle = document.getElementById('theme-toggle');

const THEME_KEY = 'theme';

const getPreferredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.body.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  themeToggle.textContent = isDark ? '화이트 모드' : '다크 모드';
  themeToggle.setAttribute('aria-pressed', String(isDark));
};

applyTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

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
