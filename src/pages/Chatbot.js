import React, { useState } from 'react';
import './Chatbot.css';
import closeIcon from '../assets/close.png';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (userMessage.trim()) {
      const newMessages = [...messages, { text: userMessage, sender: 'user' }];
      setMessages(newMessages);
      setUserMessage('');

      const botResponse = getBotResponse(userMessage);
      if (botResponse) {
        setMessages([...newMessages, { text: botResponse, sender: 'bot' }]);
      }
    }
  };

  const responseJson = [
    {
      "response_type": "greeting",
      "user_input": ["selamat datang", "welcome", "hai", "halo", "halo pengguna baru", "hei", "hey"],
      "bot_response": "Selamat datang di ChatCorp! Kami senang Anda bergabung. Ada yang bisa kami bantu?",
      "required_words": ["selamat", "datang", "welcome"]
    },
    {
      "response_type": "greeting",
      "user_input": ["good morning", "selamat pagi", "pagi"],
      "bot_response": "Selamat Pagi! Bagaimana saya bisa membantu Anda hari ini?",
      "required_words": []
    },
    {
      "response_type": "greeting",
      "user_input": ["good afternoon", "selamat siang", "siang"],
      "bot_response": "Selamat Siang! Ada yang bisa saya bantu?",
      "required_words": []
    },
    {
      "response_type": "greeting",
      "user_input": ["good evening", "selamat sore", "sore"],
      "bot_response": "Selamat Sore! Ada yang bisa saya bantu?",
      "required_words": []
    },
    {
      "response_type": "greeting",
      "user_input": ["good evening", "selamat malam", "malam"],
      "bot_response": "Selamat Malam! Bagaimana saya dapat membantu?",
      "required_words": []
    },
    {
      "response_type": "rules",
      "user_input": ["rules", "aturan", "peraturan"],
      "bot_response": "Untuk menjaga keamanan, pastikan tidak membagikan informasi pribadi di ruang obrolan ini. Ikuti pedoman komunitas agar semua nyaman.",
      "required_words": ["rules", "aturan", "peraturan"]
    },
    {
      "response_type": "usage",
      "user_input": ["how to use", "cara menggunakan", "bantuan"],
      "bot_response": "Untuk memulai, pilih kontak yang ingin Anda ajak bicara, lalu ketik pesan Anda di kolom chat dan tekan 'Kirim'.",
      "required_words": ["use", "menggunakan"]
    },
    {
      "response_type": "greeting",
      "user_input": ["how are you", "apa kabar", "bagaimana kabarmu"],
      "bot_response": "Saya baik, terima kasih! Bagaimana dengan Anda?",
      "required_words": []
    },  
    {
      "response_type": "usage",
      "user_input": ["create account", "membuat akun", "daftar"],
      "bot_response": "Untuk membuat akun, klik tombol ‘Daftar’ dan isi informasi yang diperlukan pada formulir pendaftaran.",
      "required_words": ["account", "akun", "daftar"]
    }, 
    {
      "response_type": "rules",
      "user_input": ["privacy policy", "kebijakan privasi"],
      "bot_response": "Kami menjaga privasi Anda dengan serius. Baca kebijakan privasi kami di halaman 'Privacy Policy' untuk informasi lebih lanjut.",
      "required_words": ["privacy", "privasi"]
    },  
    {
      "response_type": "greeting",
      "user_input": ["thank you", "terima kasih", "thanks"],
      "bot_response": "Sama-sama! Senang bisa membantu.",
      "required_words": []
    },  
    {
      "response_type": "greeting",
      "user_input": ["goodbye", "selamat tinggal", "bye"],
      "bot_response": "Sampai jumpa lagi! Semoga hari Anda menyenangkan.",
      "required_words": []
    },  
    {
      "response_type": "usage",
      "user_input": ["upload file", "unggah file", "kirim file"],
      "bot_response": "Anda dapat mengunggah file dengan mengklik ikon klip di kotak chat.",
      "required_words": ["file", "unggah"]
    },  
    {
      "response_type": "rules",
      "user_input": ["spam", "iklan", "promosi"],
      "bot_response": "Spam, iklan, dan promosi tidak diizinkan di platform ini. Harap patuhi aturan ini.",
      "required_words": ["spam", "iklan", "promosi"]
    },  
    {
      "response_type": "rules_info",
      "user_input": ["privasi", "keamanan", "data pribadi"],
      "bot_response": "Kami sangat menghargai privasi Anda. Pastikan tidak membagikan data pribadi sembarangan dan selalu gunakan pengaturan privasi yang tersedia.",
      "required_words": ["privasi", "keamanan", "data"]
    },
    {
      "response_type": "rules_info",
      "user_input": ["etika", "berbicara", "chatting", "bicara sopan"],
      "bot_response": "Harap selalu berbicara dengan sopan dan saling menghormati saat berkomunikasi di ChatCorp.",
      "required_words": ["etika", "berbicara", "sopan"]
    },
    {
      "response_type": "usage_info",
      "user_input": ["mulai chat", "mulai percakapan", "chat baru"],
      "bot_response": "Untuk memulai percakapan baru, klik ikon 'Chat Baru' dan pilih kontak yang ingin Anda ajak bicara.",
      "required_words": ["mulai", "chat", "percakapan"]
    },
    {
      "response_type": "rules_info",
      "user_input": ["spamming", "spam", "mengirim spam"],
      "bot_response": "Mengirim spam dilarang keras. Jika Anda melakukannya, akun Anda bisa diblokir sementara atau permanen.",
      "required_words": ["spam", "spamming"]
    },
    {
      "response_type": "rules",
      "user_input": ["apa aturan chat", "aturan penggunaan", "rules chat", "aturan main", "aturan website"],
      "bot_response": "Pastikan untuk selalu menjaga kesopanan dan tidak membagikan informasi pribadi saat menggunakan ChatCorp.",
      "required_words": ["aturan", "rules", "chat"]
    },
    {
      "response_type": "rules",
      "user_input": ["apakah aman", "keamanan data", "privasi", "chat aman", "aman tidak"],
      "bot_response": "ChatCorp menggunakan enkripsi AES-256 untuk melindungi data Anda, sehingga percakapan Anda aman.",
      "required_words": ["aman", "keamanan", "privasi"]
    },
    {
        "response_type": "question",
        "user_input": ["apa", "saja", "bagaimana", "cara", "informasi", "info", "rekruitmen", "pendaftaran", "melihat", "mendapatkan", "mendapat", "organisasi", "ukm", "update", "terbaru"],
        "bot_response": "Untuk informasi tersebut, anda dapat melakukan register atau membuat akun terlebih dahulu dan mulai untuk berdiskusi pada platform ChatCorp.",
        "required_words": []
    },
    {
        "response_type": "security_info",
        "user_input": ["apakah chatcorp memiliki fitur enkripsi?", "fitur keamanan di chatcorp", "enkripsi di chatcorp"],
        "bot_response": "ChatCorp menggunakan enkripsi AES-256 untuk melindungi semua data pesan Anda. Ini memastikan pesan Anda aman dari pihak yang tidak berwenang.",
        "required_words": ["enkripsi", "keamanan"]
    },
    {
        "response_type": "rules",
        "user_input": ["bagaimana menghindari penipuan?", "tips keamanan di chatcorp", "hindari penipuan"],
        "bot_response": "Jangan membagikan informasi pribadi kepada siapa pun di platform ini dan selalu waspada terhadap pesan yang mencurigakan.",
        "required_words": ["penipuan", "keamanan"]
    },
    {
        "response_type": "security_info",
        "user_input": ["apakah data saya aman di server?", "bagaimana chatcorp melindungi data?", "keamanan data di server"],
        "bot_response": "Data Anda disimpan di server dengan keamanan tingkat tinggi dan dilindungi oleh enkripsi untuk mencegah akses yang tidak sah.",
        "required_words": ["data", "server"]
    },
    {
        "response_type": "question",
        "user_input": ["apa", "bagaimana", "informasi", "info", "lomba", "pertandingan", "melihat", "mendapatkan", "update", "terbaru", "mengenai", "seputar"],
        "bot_response": "Untuk informasi tersebut, anda dapat melakukan register atau membuat akun terlebih dahulu dan mulai untuk berdiskusi pada platform ChatCorp.",
        "required_words": []
    },
    {
      "response_type": "security_info",
      "user_input": ["bagaimana chatcorp melindungi privasi?", "privasi di chatcorp", "data pribadi di chatcorp"],
      "bot_response": "Privasi Anda adalah prioritas kami. ChatCorp mengenkripsi semua data pesan dan memastikan tidak ada yang bisa mengakses kecuali Anda dan penerima.",
      "required_words": ["privasi", "data pribadi"]
    },
    {
      "response_type": "security_info",
      "user_input": ["apakah pesan bisa diakses pihak ketiga?", "apakah chatcorp aman dari peretasan?", "apakah data saya aman?"],
      "bot_response": "Dengan enkripsi end-to-end dan kebijakan keamanan ketat, ChatCorp memastikan tidak ada pihak ketiga yang dapat mengakses pesan Anda.",
      "required_words": ["pihak ketiga", "keamanan"]
    },
    {
      "response_type": "security_info",
      "user_input": ["bagaimana mengirim pesan dengan aman?", "tips mengirim pesan aman", "cara aman kirim pesan?"],
      "bot_response": "Pastikan Anda menggunakan kata sandi yang kuat dan tidak membagikannya kepada siapa pun untuk memastikan keamanan saat mengirim pesan di ChatCorp.",
      "required_words": ["pesan", "aman"]
    },
    {
      "response_type": "security_info",
      "user_input": ["bagaimana cara mencegah peretasan?", "tips keamanan akun", "menghindari peretasan"],
      "bot_response": "Selalu gunakan autentikasi dua faktor dan perbarui kata sandi secara rutin untuk mencegah peretasan akun di ChatCorp.",
      "required_words": ["peretasan", "akun"]
    },
    {
      "response_type": "security_info",
      "user_input": ["siapa yang bisa melihat pesan saya?", "apakah pesan saya pribadi?", "privasi pesan di chatcorp"],
      "bot_response": "Hanya Anda dan penerima yang bisa melihat pesan Anda. Enkripsi end-to-end ChatCorp memastikan pesan Anda tetap pribadi.",
      "required_words": ["pesan", "privasi"]
    },
    {
      "response_type": "security_info",
      "user_input": ["apakah ada audit keamanan?", "audit keamanan chatcorp", "chatcorp diaudit?"],
      "bot_response": "Ya, ChatCorp menjalani audit keamanan rutin untuk memastikan semua protokol keamanan berfungsi dengan baik dan sesuai standar industri.",
      "required_words": ["audit", "keamanan"]
    }
    ];

  const getBotResponse = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    for (const response of responseJson) {
      if (response.user_input.some(input => lowerCaseMessage.includes(input))) {
        return response.bot_response;
      }
    }

    // Tidak ada respons jika tidak ada kecocokan
    return null;
  };

  return (
    <div>
      <div className="chat-icon-container">
        <button className="chat-icon" onClick={toggleChat}>💬</button>
      </div>

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
          <img src={closeIcon} alt="close" className="close-icon" onClick={toggleChat} />
            <h1>Toro!</h1>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input 
              type="text" 
              value={userMessage} 
              onChange={handleInputChange} 
              onKeyPress={handleKeyPress}
              placeholder="Type your message..." 
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
