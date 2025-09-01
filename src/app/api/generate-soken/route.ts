import { NextRequest, NextResponse } from 'next/server';
import { 
  generateSoken, 
  parseCSV, 
  arrayToCSV, 
  arrayToTSV, 
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
    
    // デバッグ情報をログ出力
    console.log('CSVデータ解析結果:', csvData.length, '行');
    console.log('CSVヘッダー情報:', Object.keys(csvData[0] || {}));
    
    // **重要**: 各行に所見を生成（F列→E列マッピング対応）
    csvData.forEach((row, index) => {
      // F列→E列マッピング: F列のエピソードを読み取り、E列に所見を生成
      const episodeColumn = getColumnValue(row, ['F列エピソード（生成→E列）', '特徴的なエピソード', 'エピソード', 'episode', 'F列']);
      
      // **デバッグ強化**: より詳細なデバッグ情報
      console.log(`\n=== 処理中: 配列インデックス${index} (CSVの実際の行${index + 2}) ===`);
      console.log('行の完全データ:', JSON.stringify(row, null, 2));
      console.log('F列(エピソード)の内容:', JSON.stringify(episodeColumn));
      console.log('学年:', row['学年'], '組:', row['組'], '番号:', row['番号']);
      
      // **重要**: 必ず各行を処理（エピソードが空でも行の構造を保持）
      if (episodeColumn && episodeColumn.trim()) {
        const episodes = episodeColumn.split('\n').filter((ep: string) => ep.trim());
        console.log(`エピソード分割結果:`, episodes);
        
        const soken = generateSoken(episodes);
        console.log(`生成された所見 (配列インデックス${index}):`, soken.substring(0, 50) + '...');
        
        // **F列→E列マッピング**: E列（最終所見）に設定
        console.log(`処理前のE列内容:`, JSON.stringify(row['E列最終所見']));
        setColumnValue(row, ['E列最終所見', '総合所見（200文字）', '総合所見', '所見', 'remarks'], soken);
        console.log(`処理後のE列内容:`, JSON.stringify(row['E列最終所見']));
        console.log(`✅ 配列インデックス${index}: F列→E列 所見設定完了`);
      } else {
        console.log(`配列インデックス${index}: F列エピソードが空 - 所見生成スキップ`);
        // 空の所見を設定（行の整合性を保つため）
        setColumnValue(row, ['E列最終所見', '総合所見（200文字）', '総合所見', '所見', 'remarks'], '');
        console.log(`配列インデックス${index}: 空の所見を設定`);
      }
      console.log(`配列インデックス${index}処理完了\n`);
    });
    
    // CSV/TSVに変換（元のヘッダー順序を保持）
    const resultCSV = arrayToCSV(csvData, originalHeaders);
    const resultTSV = arrayToTSV(csvData, originalHeaders);
    
    // 複数のエンコーディング形式で提供
    const bomCSV = '\uFEFF' + resultCSV;  // BOM付きUTF-8 CSV
    const bomTSV = '\uFEFF' + resultTSV;  // BOM付きUTF-8 TSV
    
    return NextResponse.json({
      success: true,
      csv: bomCSV,
      tsv: bomTSV,
      csvRaw: resultCSV,  // BOMなしUTF-8（フロントエンドでShift_JIS変換用）
      message: '所見の生成が完了しました。'
    });
    
  } catch (error) {
    console.error('所見生成エラー:', error);
    return NextResponse.json({ 
      error: '所見生成中にエラーが発生しました。', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}