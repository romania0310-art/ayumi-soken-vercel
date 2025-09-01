// 所見生成のロジック（改良版） - Express.jsから移植
export function generateSoken(episodes: string[]): string {
  // カリマネ資料に基づく所見テンプレート（特別活動・特別支援対応版）
  const templates = [
    // 特別活動・行動面中心のテンプレート（最優先）
    {
      keywords: ['リーダーシップ', 'リーダー', '委員会', '係', '当番', '責任', '協力', '協働', '話し合い', '司会', '進行', '運営', '企画', '準備', '片付け', '清掃', '掃除', '挨拶', '返事', 'あいさつ', '発表', '意見', '提案', '相談', '支援', '手伝い', '助け', '励まし', '声かけ'],
      template: '学級や学校での活動において、責任感をもって役割を果たし、友だちと協力しながら取り組む姿が見られます。'
    },
    // 体育中心のテンプレート
    {
      keywords: ['体育', 'リレー', 'バトン', '走', 'リズム', '運動', 'ハードル', 'チームワーク', 'スポーツ'],
      template: '体育の学習では、チームワークを大切にし、運動に真剣に取り組んでいます。'
    },
    // 図工中心のテンプレート
    {
      keywords: ['図工', '制作', '作品', '表現', '創作', '美術', 'アート', '工作'],
      template: '図工の学習では、作品制作に真剣に取り組み、創造性豊かな表現をしています。'
    },
    // 音楽中心のテンプレート  
    {
      keywords: ['音楽', 'リコーダー', 'タンギング', '演奏', '楽器', '合奏', '歌'],
      template: '音楽の学習では、リコーダー演奏で丁寧な演奏技術を身に付けています。'
    },
    // 国語中心のテンプレート
    {
      keywords: ['物語', '心情', '読み取', '登場人物', '文章', '言葉', '表現', '国語'],
      template: '国語の物語学習では、登場人物の心情を丁寧に読み取り、自分の考えを深めています。'
    },
    // 算数中心のテンプレート  
    {
      keywords: ['図形', '辺', '角', '長さ', '計算', '数', '相等', '算数'],
      template: '算数の図形学習では、辺の長さや角の大きさに気を付けて論理的に取り組んでいます。'
    },
    // 理科・観察中心のテンプレート
    {
      keywords: ['観察', '実験', '自然', '発見', '理科'],
      template: '理科の学習では、観察や実験を通して自然に関心をもって取り組んでいます。'
    },
    // 社会性・コミュニケーション中心のテンプレート
    {
      keywords: ['友だち', '友達', '仲間', '優しい', '親切', '思いやり', 'コミュニケーション', '関わり', '交流'],
      template: '友だちとの関わりを大切にし、相手の気持ちを考えて行動することができます。'
    }
  ];

  let sokenParts: string[] = [];
  
  // エピソードを処理（特別活動観点強化版）
  episodes.forEach(episode => {
    if (!episode.trim() || episode.trim() === '・') return;
    
    console.log(`所見生成: エピソード "${episode}" を分析中`);
    
    // エピソードから適切なテンプレートを選択（複数マッチも考慮）
    let selectedTemplate = templates[templates.length - 1]; // デフォルトは最後のテンプレート
    let bestMatchScore = 0;
    
    for (const template of templates) {
      const matchedKeywords = template.keywords.filter(keyword => episode.includes(keyword));
      if (matchedKeywords.length > bestMatchScore) {
        console.log(`キーワードマッチ: [${matchedKeywords.join(', ')}] → ${template.template.substring(0, 30)}...`);
        selectedTemplate = template;
        bestMatchScore = matchedKeywords.length;
      }
    }
    
    if (bestMatchScore === 0) {
      console.log(`⚠️ キーワードマッチなし - デフォルトテンプレート使用: ${selectedTemplate.template.substring(0, 30)}...`);
    } else {
      console.log(`✅ 最適マッチ (${bestMatchScore}個のキーワード): ${selectedTemplate.template.substring(0, 30)}...`);
    }
    
    sokenParts.push(selectedTemplate.template);
  });
  
  // 重複除去と質の向上
  sokenParts = [...new Set(sokenParts)];
  
  // 横浜市表記ルールに基づく締めの文章（温かい励ましの言葉）
  if (sokenParts.length > 1) {
    sokenParts.push('学習や生活の様々な場面で、よさを発揮しています。');
  }
  sokenParts.push('これからも自分らしさを大切にしながら、さらなる成長を期待しています。');
  
  let fullSoken = sokenParts.join('');
  
  // 横浜市表記ルールに基づく調整
  fullSoken = fullSoken
    .replace(/・/g, '') // 不要な中点を除去
    .replace(/。。/g, '。') // 重複句点の除去
    .replace(/\s+/g, ''); // 余分な空白を除去
  
  console.log(`所見生成完了 (カリマネ準拠): 文字数 ${fullSoken.length}文字`);
  
  // 200文字制限対応（文章の自然な切れ目を重視）
  if (fullSoken.length > 200) {
    console.log(`⚠️ 文字数超過 (${fullSoken.length}文字) - カリマネ準拠短縮処理実行`);
    let truncated = fullSoken.substring(0, 175); // 締めの文章用に余裕を持たせる
    // 最後の自然な句点で切る
    const lastPeriod = Math.max(
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('ます。'),
      truncated.lastIndexOf('います。')
    );
    
    if (lastPeriod > 120) { // 十分な長さを確保
      const result = truncated.substring(0, lastPeriod + 1) + 'これからもさらなる成長を期待しています。';
      console.log(`カリマネ準拠文字数調整完了: ${result.length}文字`);
      return result;
    }
    const result = truncated.substring(0, 170) + 'ています。これからも成長を期待しています。';
    console.log(`カリマネ準拠文字数調整完了: ${result.length}文字`);
    return result;
  }
  
  console.log(`所見生成完了: ${fullSoken.length}文字（制限内）`);
  return fullSoken;
}

// CSVパース関数（改行やカンマを含む値に対応、ヘッダー順序も保持）
export function parseCSV(csvText: string): { data: any[], headers: string[] } {
  // 文字コードの正規化（CRLF -> LF）
  const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const rows = [];
  const lines = normalizedText.split('\n');
  let currentRow = '';
  let inQuotes = false;
  
  for (let line of lines) {
    if (!inQuotes && line.trim() === '') continue;
    
    currentRow += (currentRow ? '\n' : '') + line;
    
    // クォートの数をカウント
    const quoteCount = (currentRow.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 !== 0;
    
    if (!inQuotes) {
      rows.push(currentRow);
      currentRow = '';
    }
  }
  
  if (currentRow) rows.push(currentRow);
  if (rows.length === 0) return { data: [], headers: [] };
  
  // ヘッダー行の処理
  const headers = parseCSVRow(rows[0]).map(h => h.trim());
  const result = [];
  
  console.log('元のヘッダー順序:', headers);
  console.log('パースされた行数:', rows.length);
  
  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVRow(rows[i]);
    const row: any = {};
    
    console.log(`行${i}: パース結果 =`, values);
    
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    
    // 行の構造を保持するため、空行でもpushする（学年・組・番号があれば有効行とする）
    const hasBasicInfo = row['学年'] || row['組'] || row['番号'];
    if (hasBasicInfo || Object.values(row).some(val => val)) {
      result.push(row);
    } else {
      console.log(`行${i}: 基本情報がないためスキップ`);
    }
  }
  
  console.log('最終結果行数:', result.length);
  return { data: result, headers: headers };
}

// CSV行をパースする関数
export function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // 次の文字をスキップ
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// CSVを文字列に変換（列順序を保持）
export function arrayToCSV(data: any[], originalHeaders?: string[]): string {
  if (data.length === 0) return '';
  
  // 元の列順序を使用、なければ動的に取得
  const headers = originalHeaders || Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      const fieldStr = String(value || '');
      // 以下の条件で引用符を追加：
      // 1. カンマを含む場合
      // 2. 改行を含む場合  
      // 3. ダブルクォートを含む場合
      // 4. 日本語句読点（、。）を含む場合
      // 5. 20文字以上の長いテキスト（所見などの長文）
      // 6. 空文字ではない文字列（基本的にすべてのフィールドを引用符で囲む）
      if (fieldStr.includes(',') || 
          fieldStr.includes('\n') || 
          fieldStr.includes('"') ||
          fieldStr.includes('、') || 
          fieldStr.includes('。') ||
          fieldStr.length > 20 ||
          (fieldStr.trim() && fieldStr.length > 0)) {
        return `"${fieldStr.replace(/"/g, '""')}"`;
      }
      return fieldStr;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// TSVを文字列に変換（列順序を保持）
export function arrayToTSV(data: any[], originalHeaders?: string[]): string {
  if (data.length === 0) return '';
  
  // 元の列順序を使用、なければ動的に取得
  const headers = originalHeaders || Object.keys(data[0]);
  const tsvRows = [headers.join('\t')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // TSVではタブ、改行をスペースに置換
      return value.replace(/\t/g, '    ').replace(/\n/g, ' ').replace(/\r/g, '');
    });
    tsvRows.push(values.join('\t'));
  });
  
  return tsvRows.join('\n');
}

// 文字エンコーディング検出と変換（改良版）
export async function detectEncodingAndRead(buffer: ArrayBuffer): Promise<string> {
  try {
    // Uint8Arrayに変換
    const uint8Array = new Uint8Array(buffer);
    
    // BOM検出
    if (uint8Array.length >= 3) {
      // UTF-8 BOM: EF BB BF
      if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
        console.log('UTF-8 BOMを検出');
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(buffer.slice(3)); // BOMを除去
      }
    }
    
    // 複数のエンコーディングを試行
    const encodings = ['utf-8', 'shift_jis', 'euc-jp', 'iso-2022-jp'];
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: true });
        const text = decoder.decode(buffer);
        
        // 日本語文字の存在をチェック
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
        
        // 文字化け文字（replacement character）がないかチェック
        const hasReplacementChar = text.includes('\uFFFD') || text.includes('�');
        
        if (hasJapanese && !hasReplacementChar) {
          console.log(`成功したエンコーディング: ${encoding}`);
          return text;
        }
        
        // UTF-8で文字化けがない場合も有効とする
        if (encoding === 'utf-8' && !hasReplacementChar) {
          console.log('UTF-8で読み込み成功（日本語なし）');
          return text;
        }
        
      } catch (error) {
        console.log(`${encoding} での読み込み失敗:`, error);
        continue;
      }
    }
    
    // すべて失敗した場合は、UTF-8でエラーを無視して読み込み
    console.warn('すべてのエンコーディングでの読み込みに失敗、UTF-8（エラー無視）で読み込み');
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(buffer);
    
  } catch (error) {
    console.error('文字エンコーディング検出エラー:', error);
    // 最終的なフォールバック
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(buffer);
  }
}