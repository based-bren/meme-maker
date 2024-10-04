'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWindowSize } from '../hooks/useWindowSize'

interface MemeTemplate {
  id: number
  src: string
  alt: string
}

interface TextBox {
  id: number
  text: string
  x: number
  y: number
  fontSize: number
  color: string
}

export function Page() {
  const windowSize = useWindowSize()
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [memeTemplates, setMemeTemplates] = useState<MemeTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null)
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
  const [draggedTextBox, setDraggedTextBox] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (windowSize.width) {
      setItemsPerPage(windowSize.width >= 768 ? 15 : 6)
    }
  }, [windowSize.width])

  useEffect(() => {
    fetch('/api/memes')
      .then(response => response.json())
      .then(data => setMemeTemplates(data))
  }, [])

  const totalPages = Math.ceil(memeTemplates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTemplates = memeTemplates.slice(startIndex, endIndex)

  useEffect(() => {
    if (selectedTemplate) {
      setTextBoxes([
        { id: 1, text: 'Top text', x: 150, y: 30, fontSize: 20, color: '#ffffff' },
        { id: 2, text: 'Bottom text', x: 150, y: 270, fontSize: 20, color: '#ffffff' },
      ])
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (selectedTemplate && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 300, 300)
          textBoxes.forEach((textBox) => {
            ctx.font = `${textBox.fontSize}px 'Press Start 2P', cursive`
            ctx.fillStyle = textBox.color
            ctx.textAlign = 'center'
            ctx.fillText(textBox.text, textBox.x, textBox.y)
          })
        }
        img.src = selectedTemplate.src
      }
    }
  }, [selectedTemplate, textBoxes])

  const handleTextChange = (id: number, text: string) => {
    setTextBoxes(textBoxes.map((box) => (box.id === id ? { ...box, text } : box)))
  }

  const handleFontSizeChange = (id: number, fontSize: number) => {
    setTextBoxes(textBoxes.map((box) => (box.id === id ? { ...box, fontSize } : box)))
  }

  const handleColorChange = (id: number, color: string) => {
    setTextBoxes(textBoxes.map((box) => (box.id === id ? { ...box, color } : box)))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>, id: number) => {
    setDraggedTextBox(id)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedTextBox !== null) {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setTextBoxes(textBoxes.map((box) => (box.id === draggedTextBox ? { ...box, x, y } : box)))
      }
    }
  }

  const handleMouseUp = () => {
    setDraggedTextBox(null)
  }

  const generateMeme = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'meme.png'
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="min-h-screen px-2 py-4 bg-retro-pattern text-white font-pixel flex flex-col">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        body {
          background-color: #000000;
          color: #ffffff;
          font-family: 'Press Start 2P', cursive;
        }

        .font-pixel {
          font-family: 'Press Start 2P', cursive;
        }

        .green-glow {
          box-shadow: 0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0, 0 0 20px #0f0, 0 0 35px #0f0;
        }

        .green-text-glow {
          text-shadow: 0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0;
        }

        .pixel-button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 12px;
          margin: 4px 2px;
          cursor: pointer;
          transition-duration: 0.4s;
          box-shadow: inset -4px -4px 0px 0px #165b18;
        }

        .pixel-button:hover {
          background-color: #45a049;
          box-shadow: inset -6px -6px 0px 0px #165b18;
        }

        .pixel-button:active {
          background-color: #3e8e41;
          box-shadow: inset 4px 4px 0px 0px #165b18;
        }

        .bg-retro-pattern {
          background-image: 
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px);
          background-size: 16px 16px;
          background-color: #808080;
        }

        .container {
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 10px;
          padding: 10px;
        }
      `}</style>

      <div className={`container mx-auto ${windowSize.width >= 768 ? 'max-w-6xl' : 'max-w-sm'}`}>
        <h1 className="text-xl font-bold mb-4 text-center green-text-glow">Ham Meme Generator 6900</h1>
        {selectedTemplate ? (
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              onMouseDown={(e) => handleMouseDown(e, 1)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="border-4 border-white mb-4 cursor-move green-glow"
            />
            <div className="w-full">
              {textBoxes.map((textBox) => (
                <div key={textBox.id} className="mb-4">
                  <input
                    type="text"
                    value={textBox.text}
                    onChange={(e) => handleTextChange(textBox.id, e.target.value)}
                    className="w-full p-2 border-4 border-white rounded bg-black text-white font-pixel text-sm"
                  />
                  <div className="flex items-center mt-2">
                    <input
                      type="number"
                      value={textBox.fontSize}
                      onChange={(e) => handleFontSizeChange(textBox.id, parseInt(e.target.value))}
                      className="w-16 p-2 border-4 border-white rounded mr-2 bg-black text-white font-pixel text-sm"
                    />
                    <input
                      type="color"
                      value={textBox.color}
                      onChange={(e) => handleColorChange(textBox.id, e.target.value)}
                      className="w-8 h-8 border-4 border-white rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col w-full">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="pixel-button mb-2 w-full"
              >
                Choose Another Template
              </button>
              <button
                onClick={generateMeme}
                className="pixel-button w-full"
              >
                Generate Meme
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4 green-text-glow text-center">Choose a meme template:</h2>
            <div className={`grid gap-2 ${windowSize.width >= 768 ? 'grid-cols-5' : 'grid-cols-2'}`}>
              {currentTemplates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Image
                    src={template.src}
                    alt={template.alt}
                    width={windowSize.width >= 768 ? 600 : 300}
                    height={windowSize.width >= 768 ? 600 : 300}
                    className="rounded-lg green-glow w-full h-auto"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="pixel-button disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="green-text-glow text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="pixel-button disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-auto pt-8 pb-4">
        <div className="flex justify-center space-x-6">
          <a href="https://twitter.com/BrenOfTheGlen" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://warpcast.com/based-bren" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1000 1000" fill="currentColor" className="w-6 h-6">
              <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/>
              <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
              <path d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
            </svg>
          </a>
          <a href="https://opensea.io/collection/ham-pepes" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" fill="currentColor" className="w-6 h-6">
              <path d="M45 0C20.151 0 0 20.151 0 45C0 69.849 20.151 90 45 90C69.849 90 90 69.849 90 45C90 20.151 69.858 0 45 0ZM22.203 46.512L22.392 46.206L34.101 27.891C34.272 27.63 34.677 27.657 34.803 27.945C36.756 32.328 38.448 37.782 37.656 41.175C37.323 42.57 36.396 44.46 35.352 46.206C35.217 46.458 35.073 46.71 34.911 46.953C34.839 47.061 34.713 47.124 34.578 47.124H22.545C22.221 47.124 22.032 46.773 22.203 46.512ZM74.376 52.812C74.376 52.983 74.277 53.127 74.133 53.19C73.224 53.577 70.119 55.008 68.832 56.799C65.538 61.38 63.027 67.932 57.402 67.932H33.948C25.632 67.932 18.9 61.173 18.9 52.83V52.56C18.9 52.344 19.08 52.164 19.305 52.164H32.373C32.634 52.164 32.823 52.398 32.805 52.659C32.706 53.505 32.868 54.378 33.273 55.17C34.047 56.745 35.658 57.726 37.395 57.726H43.866V52.677H37.467C37.143 52.677 36.945 52.299 37.134 52.029C37.206 51.921 37.278 51.813 37.368 51.687C37.971 50.823 38.835 49.491 39.699 47.97C40.284 46.944 40.851 45.846 41.31 44.748C41.4 44.55 41.472 44.343 41.553 44.145C41.679 43.794 41.805 43.461 41.895 43.137C41.985 42.858 42.066 42.57 42.138 42.3C42.354 41.364 42.444 40.374 42.444 39.348C42.444 38.943 42.426 38.52 42.39 38.124C42.372 37.683 42.318 37.242 42.264 36.801C42.228 36.414 42.156 36.027 42.084 35.631C41.985 35.046 41.859 34.461 41.715 33.876L41.661 33.651C41.553 33.246 41.454 32.868 41.328 32.463C40.959 31.203 40.545 29.97 40.095 28.818C39.933 28.359 39.753 27.918 39.564 27.486C39.294 26.82 39.015 26.217 38.763 25.65C38.628 25.389 38.52 25.155 38.412 24.912C38.286 24.642 38.16 24.372 38.025 24.111C37.935 23.913 37.827 23.724 37.755 23.544L36.963 22.086C36.855 21.888 37.035 21.645 37.251 21.708L42.201 23.049H42.219C42.228 23.049 42.228 23.049 42.237 23.049L42.885 23.238L43.605 23.436L43.866 23.508V20.574C43.866 19.152 45 18 46.413 18C47.115 18 47.754 18.288 48.204 18.756C48.663 19.224 48.951 19.863 48.951 20.574V24.939L49.482 25.083C49.518 25.101 49.563 25.119 49.599 25.146C49.725 25.236 49.914 25.38 50.148 25.56C50.337 25.704 50.535 25.884 50.769 26.073C51.246 26.46 51.822 26.955 52.443 27.522C52.605 27.666 52.767 27.81 52.92 27.963C53.721 28.71 54.621 29.583 55.485 30.555C55.728 30.834 55.962 31.104 56.205 31.401C56.439 31.698 56.7 31.986 56.916 32.274C57.213 32.661 57.519 33.066 57.798 33.489C57.924 33.687 58.077 33.894 58.194 34.092C58.554 34.623 58.86 35.172 59.157 35.721C59.283 35.973 59.409 36.252 59.517 36.522C59.85 37.26 60.111 38.007 60.273 38.763C60.327 38.925 60.363 39.096 60.381 39.258V39.294C60.435 39.51 60.453 39.744 60.471 39.987C60.543 40.752 60.507 41.526 60.345 42.3C60.273 42.624 60.183 42.93 60.075 43.263C59.958 43.578 59.85 43.902 59.706 44.217C59.427 44.856 59.103 45.504 58.716 46.098C58.59 46.323 58.437 46.557 58.293 46.782C58.131 47.016 57.96 47.241 57.816 47.457C57.609 47.736 57.393 48.024 57.168 48.285C56.97 48.555 56.772 48.825 56.547 49.068C56.241 49.437 55.944 49.779 55.629 50.112C55.449 50.328 55.251 50.553 55.044 50.751C54.846 50.976 54.639 51.174 54.459 51.354C54.144 51.669 53.892 51.903 53.676 52.11L53.163 52.569C53.091 52.641 52.992 52.677 52.893 52.677H48.951V57.726H53.91C55.017 57.726 56.07 57.339 56.925 56.61C57.213 56.358 58.482 55.26 59.985 53.604C60.039 53.541 60.102 53.505 60.174 53.487L73.863 49.527C74.124 49.455 74.376 49.644 74.376 49.914V52.812V52.812Z"/>
            </svg>
          </a>
          <a href="https://www.hampepes.xyz/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-300 transition-colors">
            <Image
              src="/Based Pepe 1.png"
              alt="Ham Pepes"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </a>
        </div>
        <p className="text-center text-white text-xs mt-4 green-text-glow">
          © 2024 based-bren. All rights reserved.
        </p>
      </footer>
    </div>
  )
}