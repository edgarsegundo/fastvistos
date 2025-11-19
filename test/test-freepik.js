import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para usar __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = '';
let prompt = 'uma ilustração realista de um gato astronauta no espaço';

prompt = "Um passaporte aberto com um visto americano e um ingresso da Copa do Mundo ao lado, em uma mesa. Foto realista, fundo simples."

// Configurações da API
const API_CONFIG = {
  baseURL: 'https://api.freepik.com/v1/ai/mystic',
  headers: {
    'x-freepik-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
};

// Configurações da geração de imagem
const GENERATION_CONFIG = {
  prompt: prompt,
  resolution: '2k',
  aspect_ratio: 'square_1_1',
  model: 'realism',
  filter_nsfw: true
};

// Nome do arquivo de saída
const OUTPUT_FILE = 'imagem_final.png';

async function gerarImagem() {
  try {
    console.log('🚀 Iniciando geração de imagem...');
    
    // 1️⃣ Enviar requisição para gerar imagem
    const response = await axios.post(
      API_CONFIG.baseURL,
      GENERATION_CONFIG,
      {
        headers: API_CONFIG.headers
      }
    );

    const taskId = response.data.task_id;
    console.log('📝 Task ID:', taskId);

    // 2️⃣ Polling até a imagem estar pronta
    const imageUrl = await aguardarProcessamento(taskId);
    
    if (!imageUrl) {
      console.log('❌ Falha no processamento da imagem');
      return;
    }

    // 3️⃣ Baixar a imagem
    await baixarImagem(imageUrl, OUTPUT_FILE);
    
    console.log('✅ Processo concluído com sucesso!');

  } catch (error) {
    console.error('💥 Erro durante o processo:', error.response ? error.response.data : error.message);
  }
}

async function aguardarProcessamento(taskId) {
  console.log('⏳ Aguardando processamento da imagem...');
  
  const maxTentativas = 30; // Máximo de 30 tentativas (60 segundos)
  let tentativas = 0;

  while (tentativas < maxTentativas) {
    try {
      const statusResp = await axios.get(
        `${API_CONFIG.baseURL}/${taskId}`,
        { headers: API_CONFIG.headers }
      );
      
      const statusData = statusResp.data;

      switch (statusData.status) {
        case 'completed':
          console.log('🎉 Imagem pronta!');
          return statusData.result_url;
          
        case 'failed':
          console.log('❌ Falha ao gerar imagem:', statusData.error);
          return null;
          
        case 'processing':
          tentativas++;
          console.log(`🔄 Processando... Tentativa ${tentativas}/${maxTentativas}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
          
        default:
          console.log('📊 Status desconhecido:', statusData.status);
          tentativas++;
          await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('⚠️ Erro ao verificar status:', error.message);
      tentativas++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('⏰ Tempo limite excedido para processamento');
  return null;
}

async function baixarImagem(imageUrl, filename) {
  try {
    console.log('📥 Baixando imagem...');
    
    const imgResp = await axios.get(imageUrl, { 
      responseType: 'arraybuffer' 
    });
    
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, imgResp.data);
    
    console.log(`💾 Imagem salva como: ${filename}`);
    console.log(`📁 Local: ${filePath}`);
    
  } catch (error) {
    console.error('❌ Erro ao baixar imagem:', error.message);
    throw error;
  }
}

// Executar a função principal
gerarImagem();


