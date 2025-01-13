import { useState } from 'react'
import PdfViewerComponent from './components/PdfViewerComponent'
import './App.css'

function App () {
  const [document, setDocument] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpen = () => {
    setDocument(
      'https://api-xnt2upk1xwzg-server.agilix.io/uploads/document_38bf559f56.pdf'
    )

    setIsModalOpen(true)
  }

  const handleClose = () => {
    console.log('document ly thal', document)
    setIsModalOpen(false)
    setDocument(null) // Clear the document when modal closes
  }

  return (
    <div className='App'>
      <button className='App-button' onClick={handleOpen}>
        Open PDF Document
      </button>

      {isModalOpen && (
        <div className='modal-overlay' onClick={handleClose}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className='modal-close' onClick={handleClose}>
              ×
            </button>
            <div className='modal-pdf-viewer'>
              {document && <PdfViewerComponent document={document} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
