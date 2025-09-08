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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center">
              <i className="fas fa-graduation-cap mr-3 text-blue-500"></i>
              あゆみ所見自動生成システム
            </h1>
            <p className="text-sm text-gray-600 font-normal">カリマネ準拠版</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <i className="fas fa-info-circle mr-2 text-blue-600"></i>
              使用方法
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-sm leading-relaxed">
              <li className="pl-2">特徴的なエピソードが記入されたExcelファイルを準備してください</li>
              <li className="pl-2">下記のフォームからExcelファイルをアップロードします</li>
              <li className="pl-2">「所見を生成する」ボタンをクリックします</li>
              <li className="pl-2">カリマネ準拠の所見入りCSVファイル（校務システム対応）をダウンロードします</li>
            </ol>
          </div>

          <form className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 file-drop-area bg-gray-50/30">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <i className="fas fa-cloud-upload-alt text-2xl text-gray-500"></i>
                </div>
                <input 
                  type="file" 
                  id="csvFile" 
                  accept=".csv,.xlsx,.xls" 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                <label htmlFor="csvFile" className="cursor-pointer text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Excelファイルを選択してください
                </label>
                <p className="text-xs text-gray-500">
                  対応形式: .xlsx, .xls, .csv
                </p>
              </div>
              
              {selectedFile && (
                <>
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-sm text-green-700">
                      <i className="fas fa-check-circle mr-2 text-green-500"></i>
                      <span className="font-medium">選択されたファイル:</span>
                      <span className="ml-2">{selectedFile.name}</span>
                      <span className="ml-2 text-green-600">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button 
                      type="button" 
                      className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      onClick={clearFileSelection}
                    >
                      <i className="fas fa-times mr-1"></i>
                      選択を取り消す
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                type="button" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={generateSoken}
                disabled={!selectedFile || isGenerating}
              >
                <i className="fas fa-magic mr-2"></i>
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

          <div className="mt-10 bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-clipboard-list text-blue-600 text-sm"></i>
              </div>
              システムの特徴
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-sm leading-relaxed">カリキュラム・マネジメント要領に準拠した所見生成</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-sm leading-relaxed">横浜市の表記ルールに完全対応</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-sm leading-relaxed">200文字以内の適切な文字数調整</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-sm leading-relaxed">温かみのある励ましの文面</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-sm leading-relaxed">Vercel安定版で高い信頼性と固定URL</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}