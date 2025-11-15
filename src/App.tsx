import { useState } from 'react';
import './App.css';

import aiKitap from './assets/gorseller/ai-eski-kitap.png';
import aiFil from './assets/gorseller/ai-fil.png';
import aiKabak from './assets/gorseller/ai-kabak.png';
import realKitap1 from './assets/gorseller/gercek-eski-kitap1.jpg';
import realKitap2 from './assets/gorseller/gercek-eski-kitap-2.jpg';
import realFil1 from './assets/gorseller/gercek-fil.jpg';
import realFil2 from './assets/gorseller/gercek-fil-2.jpg';
import realKabak1 from './assets/gorseller/gercek-kabak-1.jpg';
import realKabak2 from './assets/gorseller/gercek-kabak-2.jpg';

// === 2. ADIM: VERİ YAPILARI ===

// Ekranda gösterilecek her bir resmin yapısı
interface GameImage {
    id: number;
    src: string;
    isAI: boolean;
}

// "Oyun Setleri" için bir yapı oluşturalım.
// Her set, 1 AI ve 2 gerçek resimden oluşacak.
type GameSet = {
    theme: string;
    gorseller: {
        src: string;
        isAI: boolean;
    }[]; // Dizi, içinde objeler var
};

// === 3. ADIM: OYUN SETLERİNİ TANIMLA ===
// Resimlerini kullanarak 3 farklı set oluşturuyoruz.
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

// Diziden rastgele bir eleman seçen yardımcı fonksiyon
const getRandomItem = (array: any[]) => {
    return array[Math.floor(Math.random() * array.length)];
};


// === 4. ADIM: ANA OYUN BİLEŞENİ ===

function App() {

    // --- Yardımcı Fonksiyon: Yeni Tur Kur ---
    // Bu fonksiyon, setlerden rastgele birini seçer, karıştırır
    // ve 'gorseller' state'i için hazırlar.
    const setupNewRound = (): GameImage[] => {
        // 1. Rastgele bir oyun seti seç (örn: 'fil' seti)
        const randomSet = getRandomItem(allGameSets);

        // 2. Seçilen setin içindeki 3 resmi karıştır
        const shuffledgorseller = randomSet.gorseller.slice().sort(() => Math.random() - 0.5);

        // 3. Karışan resimlere basit birer 'id' ata (1, 2, 3)
        return shuffledgorseller.map((image, index) => ({
            ...image,
            id: index + 1, // id: 1, 2, 3
        }));
    };

    // --- STATE'LER (Hafıza) ---
    const [gorseller, setgorseller] = useState<GameImage[]>(() => setupNewRound());
    const [message, setMessage] = useState('Sence hangisi yapay zeka ile üretildi?');
    const [gameWon, setGameWon] = useState(false);
    const [correctId, setCorrectId] = useState<number | null>(null);
    const [gameState, setGameState] = useState<'welcome' | 'playing'>('welcome');
    const [gameMode, setGameMode] = useState<'kategorili' | 'zamana_karsi' | null>(null);

    // --- OYUN MANTIĞI ---

    // Bir resme tıklandığında...
    const handleImageClick = (clickedImage: GameImage) => {
        if (gameWon) return; // Oyun kazanıldıysa tıklamayı engelle

        // A. DOĞRU BİLİRSE
        if (clickedImage.isAI) {
            setMessage('Tebrikler! Doğru görseli buldun.');
            setGameWon(true);
            setCorrectId(clickedImage.id);
        }
        // B. YANLIŞ BİLİRSE
        else {
            setMessage('Yanlış seçim! Bu gerçek bir görseldi. Kalanlardan tekrar dene.');

            // Hocanın istediği: Yanlış resmi listeden kaldır
            setgorseller(prevgorseller =>
                prevgorseller.filter(img => img.id !== clickedImage.id)
            );
        }
    };

    // "Yeni Tur" butonuna tıklandığında...
    const loadNextRound = () => {
        setgorseller(setupNewRound()); // Resimleri yeniden kur
        setMessage('Sence hangisi yapay zeka ile üretildi?');
        setGameWon(false);
        setCorrectId(null);
    };

    // --- JSX (GÖRÜNÜM) - DÜZELTİLMİŞ KISIM ---
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
                    <button onClick={() => {
                        setGameMode('zamana_karsi');
                        setGameState('playing');
                    }} className="btn-primary" >
                        Zamana Karşı Mod
                    </button>
                </>
            ) : (
                // 2. DURUM: Oyun Ekranı (Oyun Başladı)
                // 'gameState' 'playing' ise, BURADA YENİ BİR KONTROL YAPIYORUZ
                // JavaScript kodu için { } açtık
                gameMode === 'kategorili' ? (
                    // 2a. ALT DURUM: Kategorili Mod
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
                    // 2b. ALT DURUM: Zamana Karşı Mod
                    <>
                        <h2>Zamana Karşı Mod</h2>
                        <p>Bu mod şu an yapım aşamasında!</p>
                        <button onClick={() => setGameState('welcome')}>Ana Menüye Dön</button>
                    </>
                )

                // JavaScript kod bloğu { } kapandı
                )}
            {/* Ana 'gameState' kontrolü ( ) kapandı */}
        </div>
    );
}

export default App;