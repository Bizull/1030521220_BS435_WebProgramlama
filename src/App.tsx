import { useState, useEffect } from 'react';
import './App.css';

// DİKKAT: Klasör adın 'gorseller' ise bu yollar doğru.
// Eğer klasör adın 'images' ise aşağıdaki 'gorseller' kısımlarını 'images' yapmalısın.
import aiKitap from './assets/gorseller/ai-eski-kitap.png';
import aiFil from './assets/gorseller/ai-fil.png';
import aiKabak from './assets/gorseller/ai-kabak.png';
import realKitap1 from './assets/gorseller/gercek-eski-kitap1.jpg';
import realKitap2 from './assets/gorseller/gercek-eski-kitap-2.jpg';
import realFil1 from './assets/gorseller/gercek-fil.jpg';
import realFil2 from './assets/gorseller/gercek-fil-2.jpg';
import realKabak1 from './assets/gorseller/gercek-kabak-1.jpg';
import realKabak2 from './assets/gorseller/gercek-kabak-2.jpg';

// === VERİ YAPILARI ===
interface GameImage {
    id: number;
    src: string;
    isAI: boolean;
}

type GameSet = {
    theme: string;
    gorseller: {
        src: string;
        isAI: boolean;
    }[];
};

const allGameSets: GameSet[] = [
    {
        theme: 'kitap',
        gorseller: [
            { src: aiKitap, isAI: true },
            { src: realKitap1, isAI: false },
            { src: realKitap2, isAI: false },
        ],
    },
    {
        theme: 'fil',
        gorseller: [
            { src: aiFil, isAI: true },
            { src: realFil1, isAI: false },
            { src: realFil2, isAI: false },
        ],
    },
    {
        theme: 'kabak',
        gorseller: [
            { src: aiKabak, isAI: true },
            { src: realKabak1, isAI: false },
            { src: realKabak2, isAI: false },
        ],
    },
];

const getRandomItem = (array: any[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

// === ANA OYUN BİLEŞENİ ===
function App() {

    // --- Yardımcı Fonksiyon: Yeni Tur Kur ---
    const setupNewRound = (): GameImage[] => {
        const randomSet = getRandomItem(allGameSets);
        const shuffledGorseller = randomSet.gorseller.slice().sort(() => Math.random() - 0.5);
        return shuffledGorseller.map((image, index) => ({
            ...image,
            id: index + 1,
        }));
    };

    // --- STATE'LER ---
    const [gorseller, setGorseller] = useState<GameImage[]>(() => setupNewRound());
    const [message, setMessage] = useState('Sence hangisi yapay zeka ile üretildi?');
    const [gameWon, setGameWon] = useState(false);
    const [correctId, setCorrectId] = useState<number | null>(null);

    // Oyun Durumu ve Modu
    const [gameState, setGameState] = useState<'welcome' | 'playing'>('welcome');
    const [gameMode, setGameMode] = useState<'kategorili' | 'zamana_karsi' | null>(null);

    // Zamana Karşı Mod State'leri
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);

    // --- ZAMANLAYICI (TIMER) MANTIĞI ---
    useEffect(() => {
        let interval: any = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false); // Süre bitti
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);


    // --- KATEGORİLİ MOD TIKLAMA MANTIĞI ---
    const handleImageClick = (clickedImage: GameImage) => {
        if (gameWon) return;

        if (clickedImage.isAI) {
            setMessage('Tebrikler! Doğru görseli buldun.');
            setGameWon(true);
            setCorrectId(clickedImage.id);
        } else {
            setMessage('Yanlış seçim! Bu gerçek bir görseldi. Kalanlardan tekrar dene.');
            setGorseller(prevGorseller =>
                prevGorseller.filter(img => img.id !== clickedImage.id)
            );
        }
    };

    // --- ZAMANA KARŞI TIKLAMA MANTIĞI ---
    const handleTimeAttackClick = (clickedImage: GameImage) => {
        if (timeLeft === 0) return;

        if (clickedImage.isAI) {
            setScore(prev => prev + 10);
            setMessage('Süper! +10 Puan');
            setGorseller(setupNewRound());
        } else {
            setMessage('Yanlış! -2 Saniye ceza!');
            setGorseller(prev => prev.filter(img => img.id !== clickedImage.id));
            setTimeLeft(prev => (prev > 2 ? prev - 2 : 0));
        }
    };

    const loadNextRound = () => {
        setGorseller(setupNewRound());
        setMessage('Sence hangisi yapay zeka ile üretildi?');
        setGameWon(false);
        setCorrectId(null);
    };

    // Zamana Karşı Modu Başlat
    const startTimeAttackMode = () => {
        setGameMode('zamana_karsi');
        setGameState('playing');
        setScore(0);
        setTimeLeft(30);
        setTimerActive(true);
        setGorseller(setupNewRound());
        setMessage('Hızlı ol! Yapay zekayı bul!');
    };

    // --- JSX (GÖRÜNÜM) ---
    return (
        <div className="App">
            {gameState === 'welcome' ? (
                // 1. DURUM: Karşılama Ekranı
                <>
                    <h1>Yapay Zekayı Bul!</h1>
                    <p>Bu oyunda sana 3 adet görsel sunulacak. İkisi gerçek, biri yapay zeka. Amacın yapay zeka ile üretilmiş olanı bulmak!</p>

                    <h2>Lütfen bir oyun modu seç:</h2>

                    <button onClick={() => {
                        setGameMode('kategorili');
                        setGameState('playing');
                    }} className="btn-primary">
                        Kategorili Mod
                    </button>

                    <button onClick={startTimeAttackMode} className="btn-primary">
                        Zamana Karşı Mod
                    </button>
                </>
            ) : (
                // 2. DURUM: Oyun Ekranı
                // Ternary Operatörü: gameMode kategorili mi?
                gameMode === 'kategorili' ? (
                    // 2a. Kategorili Mod
                    <>
                        <h1>Yapay Zekayı Bul!</h1>
                        <p className="message">{message}</p>
                        <div className="image-container">
                            {gorseller.map(image => (
                                <div
                                    key={image.id}
                                    className={`image-box ${correctId === image.id ? 'correct' : ''}`}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <img src={image.src} alt="Tahmin görseli" />
                                </div>
                            ))}
                        </div>
                        {gameWon && (
                            <button className="btn-primary" onClick={loadNextRound}>
                                Yeni Tur
                            </button>
                        )}
                    </>
                ) : (
                    // 2b. Zamana Karşı Mod
                    <>
                        {/* Bilgi Çubuğu */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span style={{ color: timeLeft < 10 ? 'red' : 'black' }}>
                                Süre: {timeLeft}
                            </span>
                            <span style={{ color: '#007bff' }}>
                                Puan: {score}
                            </span>
                        </div>

                        {/* Süre Kontrolü */}
                        {timeLeft === 0 ? (
                            <div className="game-over">
                                <h2>Süre Doldu!</h2>
                                <p style={{ fontSize: '1.5rem' }}>Toplam Puanın: <strong>{score}</strong></p>

                                <button className="btn-primary" onClick={startTimeAttackMode}>
                                    Tekrar Oyna
                                </button>
                                <button className="btn-primary" onClick={() => setGameState('welcome')}>
                                    Ana Menü
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3>{message}</h3>
                                <div className="image-container">
                                    {gorseller.map(image => (
                                        <div
                                            key={image.id}
                                            className="image-box"
                                            onClick={() => handleTimeAttackClick(image)}
                                        >
                                            <img src={image.src} alt="Tahmin görseli" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )
            )}
        </div>
    );
}

export default App;