'use client'

import { useState } from 'react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsGenerated(false)
    }
  }

  const clearFileSelection = () => {
    setSelectedFile(null)
    setIsGenerated(false)
    const fileInput = document.getElementById('csvFile') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const excelToCSV = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer)
          // @ts-ignore - XLSX is loaded via CDN
          const workbook = XLSX.read(data, { type: 'array' })
          
          // 最初のシートを取得
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // CSVに変換
          // @ts-ignore - XLSX is loaded via CDN
          const csv = XLSX.utils.sheet_to_csv(worksheet)
          resolve(csv)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const generateSoken = async () => {
    if (!selectedFile) {
      alert('Excelファイルを選択してください。')
      return
    }

    setIsGenerating(true)

    try {
      let processFile = selectedFile

      // ファイル形式を判定してCSVに変換
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        console.log('Excel形式を検出、CSVに変換中...')
        const csvData = await excelToCSV(selectedFile)
        
        // CSVデータをBlobに変換してFileオブジェクト作成
        const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
        processFile = new File([csvBlob], selectedFile.name.replace(/\.xlsx?$/, '.csv'), { type: 'text/csv' })
      }

      const formData = new FormData()
      formData.append('csv', processFile)

      const response = await fetch('/api/generate-soken', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('所見生成に失敗しました。')
      }

      const responseData = await response.json()
      console.log('所見生成完了:', responseData.message)

      setIsGenerated(true)
    } catch (error) {
      console.error('生成エラー詳細:', error)
      alert('エラーが発生しました: ' + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCSV = async () => {
    if (!selectedFile) {
      alert('Excelファイルを選択してください。')
      return
    }

    try {
      let processFile = selectedFile

      // ファイル形式を判定してCSVに変換
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        console.log('Excel形式を検出、CSVに変換中...')
        const csvData = await excelToCSV(selectedFile)
        
        // CSVデータをBlobに変換してFileオブジェクト作成
        const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
        processFile = new File([csvBlob], selectedFile.name.replace(/\.xlsx?$/, '.csv'), { type: 'text/csv' })
      }

      // Excel専用形式でダウンロード
      const formData = new FormData()
      formData.append('csv', processFile)

      const response = await fetch('/api/generate-soken-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('所見生成に失敗しました。')
      }

      // レスポンスをBlobとして取得
      const blob = await response.blob()

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', 'あゆみ所見_完成版.csv')
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // URLを解放
      URL.revokeObjectURL(url)

      // ダウンロード後の案内
      setTimeout(() => {
        alert('ダウンロードが完了しました。\n\nExcel最適化形式で出力されています。\nExcelで直接開いてご確認ください。')
      }, 1000)

    } catch (error) {
      console.error('ダウンロードエラー:', error)
      alert('エラーが発生しました: ' + (error as Error).message)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-black mb-6 text-center">
            <i className="fas fa-graduation-cap mr-3 text-black"></i>
            あゆみ所見自動生成システムカリマネ準拠版
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">
              <i className="fas fa-info-circle mr-2 text-black"></i>
              使用方法
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-black">
              <li>特徴的なエピソードが記入されたExcelファイルを準備してください</li>
              <li>下記のフォームからExcelファイルをアップロードします</li>
              <li>「所見を生成する」ボタンをクリックします</li>
              <li>カリマネ準拠の所見入りCSVファイル（校務システム対応）をダウンロードします</li>
            </ol>
          </div>

          <form className="space-y-6">
            <div className="border p-4 text-center mb-4">
              <input 
                type="file" 
                id="csvFile" 
                accept=".csv,.xlsx,.xls" 
                className="hidden" 
                onChange={handleFileSelect}
              />
              <label htmlFor="csvFile" className="cursor-pointer text-black">
                <i className="fas fa-upload mr-2"></i>
                ファイルを選択　選択されていません　Excelファイルを選択してください
              </label>
              <p className="text-sm text-black mt-2">
                対応形式: .xlsx, .xls, .csv
              </p>
              
              {selectedFile && (
                <>
                  <div className="mt-4 text-black">
                    選択されたファイル: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                  <div className="mt-3">
                    <button 
                      type="button" 
                      className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                      onClick={clearFileSelection}
                    >
                      ファイル選択を取り消す
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                type="button" 
                className="bg-gray-400 text-white py-2 px-6 rounded disabled:opacity-50"
                onClick={generateSoken}
                disabled={!selectedFile || isGenerating}
              >
                所見を生成する
              </button>
            </div>
          </form>

          {isGenerated && (
            <div className="mt-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                  <i className="fas fa-check-circle mr-2"></i>
                  生成完了
                </h3>
                <p className="text-gray-700 mb-4">所見の自動生成が完了しました。</p>
                <div className="flex justify-center">
                  <button 
                    className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"
                    onClick={downloadCSV}
                  >
                    <i className="fas fa-download mr-2"></i>
                    ダウンロード
                  </button>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    <i className="fas fa-info-circle mr-1 text-blue-500"></i>
                    CSVファイル（校務システム対応）で出力されます
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">所見を生成中です...</p>
            </div>
          )}

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-black mb-4">
              <i className="fas fa-clipboard-list mr-2"></i>
              システムの特徴
            </h3>
            <ul className="space-y-2 text-black">
              <li>✓カリキュラム・マネジメント要領に準拠した所見生成</li>
              <li>✓横浜市の表記ルールに完全対応</li>
              <li>✓200文字以内の適切な文字数調整</li>
              <li>✓温かみのある励ましの文面</li>
              <li>✓Vercel安定版で高い信頼性と固定URL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}