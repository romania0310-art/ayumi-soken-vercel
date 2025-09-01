import { NextRequest, NextResponse } from 'next/server';
import { 
  generateSoken, 
  parseCSV, 
  arrayToCSV, 
  detectEncodingAndRead 
} from '@/lib/soken-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
    }
    
    // ファイル内容を適切なエンコーディングで読み取り
    const buffer = await file.arrayBuffer();
    const csvText = await detectEncodingAndRead(buffer);
    
    // CSVをパース（ヘッダー順序も取得）
    const parseResult = parseCSV(csvText);
    const csvData = parseResult.data;
    const originalHeaders = parseResult.headers;
    
    console.log('保持された元のヘッダー順序:', originalHeaders);
    
    // 列名のマッピング（柔軟な列名対応）
    const getColumnValue = (row: any, possibleNames: string[]): string => {
      for (const name of possibleNames) {
        if (row[name]) return row[name];
      }
      return '';
    };
    
    const setColumnValue = (row: any, possibleNames: string[], value: string) => {
      for (const name of possibleNames) {
        if (name in row) {
          row[name] = value;
          return;
        }
      }
      // どの列も存在しない場合は最初の候補名で新しい列を作成
      row[possibleNames[0]] = value;
    };
    
    // 各行に所見を生成（F列→E列マッピング対応）
    csvData.forEach(row => {
      const episodeColumn = getColumnValue(row, ['F列エピソード（生成→E列）', '特徴的なエピソード', 'エピソード', 'episode', 'F列']);
      
      if (episodeColumn && episodeColumn.trim()) {
        const episodes = episodeColumn.split('\n').filter((ep: string) => ep.trim());
        const soken = generateSoken(episodes);
        setColumnValue(row, ['E列最終所見', '総合所見（200文字）', '総合所見', '所見', 'remarks'], soken);
      }
    });
    
    // CSVに変換（Excel向けに最適化、元のヘッダー順序を保持）
    const resultCSV = arrayToCSV(csvData, originalHeaders);
    
    // Excel専用処理：BOM + CRLF改行
    const excelCSV = '\uFEFF' + resultCSV.replace(/\n/g, '\r\n');
    
    // Excel向けのContent-Typeとヘッダー設定
    return new NextResponse(excelCSV, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename*=UTF-8\'\'%E3%81%82%E3%82%86%E3%81%BF%E6%89%80%E8%A6%8B_%E5%AE%8C%E6%88%90%E7%89%88.csv',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Excel所見生成エラー:', error);
    return NextResponse.json({ 
      error: 'Excel所見生成中にエラーが発生しました。', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}