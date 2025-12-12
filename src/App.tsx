import { useState, useEffect, useRef } from 'react'; // useRef eklendi!
import './App.css';

// === IMPORTLAR ===
// Klasör yolunun 'gorseller' veya 'images' olmasına dikkat et
import aiKitap from './assets/gorseller/ai-eski-kitap.png';
import aiFil from './assets/gorseller/ai-fil.png';
import aiKabak from './assets/gorseller/ai-kabak.png';
import aiPusula from './assets/gorseller/Ai pusula.png';
import aiKarManzara from './assets/gorseller/Ai kar manzara.png';
import aiAyManzara from './assets/gorseller/Ai manzara.png';
import aiKurabiye from './assets/gorseller/kurabiye ai.png';

import realKitap1 from './assets/gorseller/gercek-eski-kitap1.jpg';
import realKitap2 from './assets/gorseller/gercek-eski-kitap-2.jpg';
import realFil1 from './assets/gorseller/gercek-fil.jpg';
import realFil2 from './assets/gorseller/gercek-fil-2.jpg';
import realKabak1 from './assets/gorseller/gercek-kabak-1.jpg';
import realKabak2 from './assets/gorseller/gercek-kabak-2.jpg';
import realPusula1 from './assets/gorseller/gercek pusula.jpg';
import realPusula2 from './assets/gorseller/gercek pusula 2.jpg';
import realKarManzara1 from './assets/gorseller/gercek kar manzara.jpg';
import realKarManzara2 from './assets/gorseller/gercek kar manzara 2.jpg';
import realAyManzara1 from './assets/gorseller/gercek Ay 1.jpg';
import realAyManzara2 from './assets/gorseller/gercek ay 2.jpg';
import realKurabiye1 from './assets/gorseller/kurabiye gercek 1.jpg';
import realKurabiye2 from './assets/gorseller/kurabiye gercek 2.jpg';

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

// === OPTİMİZASYON: VERİ SETİNİ DIŞARI ALDIK (Global Scope) ===
// Bu değişken artık App fonksiyonunun dışında.
// Yani App her render edildiğinde (saniye başı) bu liste tekrar oluşturulmuyor.
// Sadece sayfa ilk açıldığında 1 kere oluşturuluyor.
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
    {
        theme: 'pusula',
        gorseller: [
            { src: aiPusula, isAI: true },
            { src: realPusula1, isAI: false },
            { src: realPusula2, isAI: false },
        ],
    },
    {
        theme: 'kar_manzara',
        gorseller: [
            { src: aiKarManzara, isAI: true },
            { src: realKarManzara1, isAI: false },
            { src: realKarManzara2, isAI: false },
        ],
    },
    {
        theme: 'Ay',
        gorseller: [
            { src: aiAyManzara, isAI: true },
            { src: realAyManzara1, isAI: false },
            { src: realAyManzara2, isAI: false },
        ],
    },
    {
        theme: 'kurabiye',
        gorseller: [
            { src: aiKurabiye, isAI: true },
            { src: realKurabiye1, isAI: false },
            { src: realKurabiye2, isAI: false },
        ],
    },
];

// === ANA OYUN BİLEŞENİ ===
function App() {

    // === AKILLI RASTGELELİK (TORBA MANTIĞI) ===
    // useRef kullanarak, render'lar arasında kaybolmayan bir "torba" oluşturuyoruz.
    const deckRef = useRef<number[]>([]);

    // --- Yardımcı Fonksiyon: Yeni Tur Kur ---
    const setupNewRound = (): GameImage[] => {

        // 1. Torba boşsa doldur
        if (deckRef.current.length === 0) {
            deckRef.current = allGameSets.map((_, index) => index);
        }

        // 2. Torbadan rastgele bir indeks seç
        const randomIndexInDeck = Math.floor(Math.random() * deckRef.current.length);
        const selectedSetIndex = deckRef.current[randomIndexInDeck];

        // 3. Seçilen indeksi torbadan ÇIKAR
        deckRef.current.splice(randomIndexInDeck, 1);

        // 4. O indekse denk gelen oyun setini al
        const randomSet = allGameSets[selectedSetIndex];

        // 5. Setin içindeki resimleri karıştır
        const shuffledGorseller = randomSet.gorseller.slice().sort(() => Math.random() - 0.5);

        // 6. ID verip döndür
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

    // --- ÖN YÜKLEME (PRELOADING) ---
    // Bu useEffect sadece sayfa ilk açıldığında 1 kere çalışır.
    // Tüm resimleri arka planda tarayıcıya yükletir, böylece oyun içinde kasma olmaz.
    useEffect(() => {
        allGameSets.forEach((set) => {
            set.gorseller.forEach((img) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = img.src;
                document.head.appendChild(link);
                // Alternatif JS yöntemi (garanti olsun diye):
                const i = new Image();
                i.src = img.src;
            });
        });
    }, []); // [] demek: Sadece ilk açılışta çalış

    // --- ZAMANLAYICI (TIMER) MANTIĞI ---
    useEffect(() => {
        let interval: any = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
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
        // Yeni mod başlarken torbayı sıfırlayalım ki taze başlasın
        deckRef.current = [];
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
                        // Mod değiştirirken torbayı sıfırla
                        deckRef.current = [];
                        setGorseller(setupNewRound());
                    }} className="btn-primary">
                        Kategorili Mod
                    </button>

                    <button onClick={startTimeAttackMode} className="btn-primary">
                        Zamana Karşı Mod
                    </button>
                </>
            ) : (
                // 2. DURUM: Oyun Ekranı
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span style={{ color: timeLeft < 10 ? 'red' : 'black' }}>
                                Süre: {timeLeft}
                            </span>
                            <span style={{ color: '#007bff' }}>
                                Puan: {score}
                            </span>
                        </div>

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