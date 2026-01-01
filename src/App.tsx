import { useState, useEffect, useRef } from 'react';
import './App.css';


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

interface GameImage {
    id: number;
    src: string;
    isAI: boolean;
    hint: string;
}

type GameSet = {
    theme: string;
    hint: string;
    gorseller: {
        src: string;
        isAI: boolean;
    }[];
};

const allGameSets: GameSet[] = [
    {
        theme: 'kitap',
        hint: 'Yapay zeka yazıları bazen anlamsız semboller gibi çizer. Kitap üzerindeki harflere ve doku detaylarına dikkat et!',
        gorseller: [
            { src: aiKitap, isAI: true },
            { src: realKitap1, isAI: false },
            { src: realKitap2, isAI: false },
        ],
    },
    {
        theme: 'fil',
        hint: 'Filin hortumunun ucuna ve derisindeki kırışıklıkların doğallığına odaklan. Yapay zeka bazen anatomik hatalar yapabilir.',
        gorseller: [
            { src: aiFil, isAI: true },
            { src: realFil1, isAI: false },
            { src: realFil2, isAI: false },
        ],
    },
    {
        theme: 'kabak',
        hint: 'Kabakların sap kısımlarına ve ışığın yüzeye nasıl vurduğuna bak. Aşırı pürüzsüz veya mantıksız gölgeler yapay zeka işaretidir.',
        gorseller: [
            { src: aiKabak, isAI: true },
            { src: realKabak1, isAI: false },
            { src: realKabak2, isAI: false },
        ],
    },
    {
        theme: 'pusula',
        hint: 'Pusulanın üzerindeki yön harflerine (N, S, E, W) ve metalin yansımasına dikkat et. Harfler bozuk mu?',
        gorseller: [
            { src: aiPusula, isAI: true },
            { src: realPusula1, isAI: false },
            { src: realPusula2, isAI: false },
        ],
    },
    {
        theme: 'kar_manzara',
        hint: 'Ağaç dallarının uçlarına ve karın dokusuna bak. Arka plandaki nesneler birbirine karışmış mı?',
        gorseller: [
            { src: aiKarManzara, isAI: true },
            { src: realKarManzara1, isAI: false },
            { src: realKarManzara2, isAI: false },
        ],
    },
    {
        theme: 'Ay',
        hint: 'Ay yüzeyindeki kraterlerin dağılımına ve gökyüzüyle birleştiği sınıra dikkat et. Bulutlar doğal duruyor mu?',
        gorseller: [
            { src: aiAyManzara, isAI: true },
            { src: realAyManzara1, isAI: false },
            { src: realAyManzara2, isAI: false },
        ],
    },
    {
        theme: 'kurabiye',
        hint: 'Kurabiyenin üzerindeki çikolata parçalarının şekline ve hamurun dokusuna bak. Gerçekten fırından çıkmış gibi mi?',
        gorseller: [
            { src: aiKurabiye, isAI: true },
            { src: realKurabiye1, isAI: false },
            { src: realKurabiye2, isAI: false },
        ],
    },
];


function App() {


    const deckRef = useRef<number[]>([]);


    const setupNewRound = (): GameImage[] => {


        if (deckRef.current.length === 0) {
            deckRef.current = allGameSets.map((_, index) => index);
        }


        const randomIndexInDeck = Math.floor(Math.random() * deckRef.current.length);
        const selectedSetIndex = deckRef.current[randomIndexInDeck];

        deckRef.current.splice(randomIndexInDeck, 1);

        const randomSet = allGameSets[selectedSetIndex];

        const shuffledGorseller = randomSet.gorseller.slice().sort(() => Math.random() - 0.5);

        return shuffledGorseller.map((image, index) => ({
            ...image,
            id: index + 1,
            hint: randomSet.hint
        }));
    };

    const [gorseller, setGorseller] = useState<GameImage[]>(() => setupNewRound());

    const [message, setMessage] = useState<string | JSX.Element>('Senin görevin aşağıdaki üç görselden hangisinin yapay zeka ürünü olduğunu bulmak :) hadi kolay gelsin');
    const [gameWon, setGameWon] = useState(false);
    const [correctId, setCorrectId] = useState<number | null>(null);

    const [gameState, setGameState] = useState<'welcome' | 'playing'>('welcome');
    const [gameMode, setGameMode] = useState<'kategorili' | 'zamana_karsi' | null>(null);

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        allGameSets.forEach((set) => {
            set.gorseller.forEach((img) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = img.src;
                document.head.appendChild(link);
                const i = new Image();
                i.src = img.src;
            });
        });
    }, []);

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


    const playSound = (isCorrect: boolean) => {
        const soundUrl = isCorrect
            ? "https://cdn.pixabay.com/audio/2021/08/04/audio_bb630cc098.mp3" // Başarı sesi (Ding)
            : "https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3"; // Hata sesi (Buzzer)

        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Ses çalma hatası:", e));
    };


    const handleImageClick = (clickedImage: GameImage) => {
        if (gameWon) return;

        if (clickedImage.isAI) {
            playSound(true);
            setMessage('Tebrikler! Doğru görseli buldun.');
            setGameWon(true);
            setCorrectId(clickedImage.id);
        } else {
            playSound(false);
            setMessage(
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1.4rem' }}>Yanlış!</span>
                    <span style={{ marginTop: '5px' }}>İpucu: {clickedImage.hint}</span>
                </div>
            );

            setGorseller(prevGorseller =>
                prevGorseller.filter(img => img.id !== clickedImage.id)
            );
        }
    };

    const handleTimeAttackClick = (clickedImage: GameImage) => {
        if (timeLeft === 0) return;

        if (clickedImage.isAI) {
            playSound(true);
            setScore(prev => prev + 10);
            setMessage('Süper! +10 Puan');
            setGorseller(setupNewRound());
        } else {
            playSound(false);
            setMessage('Yanlış! -2 Saniye ceza!');
            setGorseller(prev => prev.filter(img => img.id !== clickedImage.id));
            setTimeLeft(prev => (prev > 2 ? prev - 2 : 0));
        }
    };

    const loadNextRound = () => {
        setGorseller(setupNewRound());
        setMessage('Senin görevin aşağıdaki üç görselden hangisinin yapay zeka ürünü olduğunu bulmak :) hadi kolay gelsin');
        setGameWon(false);
        setCorrectId(null);
    };

    const startTimeAttackMode = () => {
        setGameMode('zamana_karsi');
        setGameState('playing');
        setScore(0);
        setTimeLeft(30);
        setTimerActive(true);
        deckRef.current = [];
        setGorseller(setupNewRound());
        setMessage('Hızlı ol! Yapay zekayı bul! hata yaparsan sürenden kesilecek...');
    };

    return (
        <div className="App">
            {gameState === 'welcome' ? (
                <>
                    <h1>Yapay Zekayı Bul!</h1>
                    <p>Bu oyunda sana 3 adet görsel sunulacak. İkisi gerçek, biri yapay zeka. Amacın yapay zeka ile üretilmiş olanı bulmak!</p>

                    <h2>Lütfen bir oyun modu seç:</h2>

                    <button onClick={() => {
                        setGameMode('kategorili');
                        setGameState('playing');
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

                gameMode === 'kategorili' ? (

                    <>
                        <h1>Yapay Zekayı Bul!</h1>
                        <div className="message">{message}</div>
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

                        <div style={{ marginTop: '30px' }}>
                            {}
                            {gameWon && (
                                <button className="btn-primary" onClick={loadNextRound}>
                                    Yeni Tur
                                </button>
                            )}

                            {}
                            <button
                                className="btn-primary"
                                style={{ backgroundColor: '#6c757d', marginLeft: '10px' }}
                                onClick={() => setGameState('welcome')}
                            >
                                Ana Menüye Dön
                            </button>
                        </div>
                    </>
                ) : (
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