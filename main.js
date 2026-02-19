const themeToggle = document.getElementById('theme-toggle');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const webcamContainer = document.getElementById('webcam-container');
const consentCheckbox = document.getElementById('consent-checkbox');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const labelContainer = document.getElementById('label-container');
const resultMain = document.getElementById('result-main');

const THEME_KEY = 'theme';
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/Jr1F_qcW6/';

let model;
let webcam;
let isRunning = false;

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

const setStatus = (text) => {
  resultMain.textContent = text;
};

const renderLabels = (predictions) => {
  labelContainer.innerHTML = '';
  predictions.forEach((item) => {
    const row = document.createElement('div');
    row.textContent = `${item.className}: ${(item.probability * 100).toFixed(1)}%`;
    labelContainer.appendChild(row);
  });
};

const getTopLabel = (predictions) => {
  if (!predictions.length) {
    return '판별 중';
  }
  const top = predictions.reduce((best, item) => (item.probability > best.probability ? item : best));
  return `${top.className}상`;
};

const setupWebcam = async () => {
  const flip = true;
  webcam = new tmImage.Webcam(280, 280, flip);
  await webcam.setup();
  await webcam.play();
  webcamContainer.innerHTML = '';
  webcamContainer.appendChild(webcam.canvas);
};

const loadModel = async () => {
  const modelURL = `${MODEL_URL}model.json`;
  const metadataURL = `${MODEL_URL}metadata.json`;
  model = await tmImage.load(modelURL, metadataURL);
};

const loop = async () => {
  if (!isRunning) {
    return;
  }
  webcam.update();
  const predictions = await model.predict(webcam.canvas);
  renderLabels(predictions);
  setStatus(getTopLabel(predictions));
  window.requestAnimationFrame(loop);
};

const startTest = async () => {
  if (isRunning) return;
  if (!consentCheckbox.checked) {
    setStatus('안내 확인 후 진행해주세요.');
    return;
  }
  setStatus('모델 로딩 중...');
  startBtn.disabled = true;
  try {
    if (!model) {
      await loadModel();
    }
    if (imageInput.files.length) {
      imageInput.value = '';
      imagePreview.textContent = '이미지를 선택하세요';
    }
    await setupWebcam();
    isRunning = true;
    stopBtn.disabled = false;
    setStatus('판별 중');
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error(error);
    setStatus('웹캠을 사용할 수 없습니다.');
    startBtn.disabled = false;
  }
};

const stopTest = async () => {
  if (!isRunning) return;
  isRunning = false;
  stopBtn.disabled = true;
  startBtn.disabled = false;
  setStatus('중지됨');
  if (webcam) {
    await webcam.stop();
  }
};

const predictImageFile = async (file) => {
  if (!file) return;
  if (!consentCheckbox.checked) {
    setStatus('안내 확인 후 진행해주세요.');
    return;
  }
  setStatus('모델 로딩 중...');
  if (!model) {
    await loadModel();
  }
  if (isRunning) {
    await stopTest();
  }
  const img = new Image();
  const fileURL = URL.createObjectURL(file);
  img.src = fileURL;
  await img.decode();
  imagePreview.innerHTML = '';
  imagePreview.appendChild(img);
  const predictions = await model.predict(img);
  renderLabels(predictions);
  setStatus(getTopLabel(predictions));
  URL.revokeObjectURL(fileURL);
};

applyTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

startBtn.addEventListener('click', startTest);
stopBtn.addEventListener('click', stopTest);
imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;
  predictImageFile(file);
});
