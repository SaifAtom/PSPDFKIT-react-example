import { useEffect, useRef } from 'react'

export default function PdfViewerComponent (props) {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    let PSPDFKit
    ;(async function () {
      try {
        PSPDFKit = await import('pspdfkit')

        // Store instance in ref for access in save function
        const instance = await PSPDFKit.load({
          container,
          document: props.document,
          baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
          toolbarItems: [
            ...PSPDFKit.defaultToolbarItems,
            {
              type: 'custom',
              id: 'save',
              title: 'Save Document',
              onPress: async () => {
                try {
                  // Get the PDF as an ArrayBuffer
                  const arrayBuffer = await instance.exportPDF()
                  console.log('Export successful', arrayBuffer)

                  // Convert ArrayBuffer to Blob
                  const blob = new Blob([arrayBuffer], {
                    type: 'application/pdf'
                  })
                  console.log('Blob created', blob)

                  // Create FormData and append file
                  const formData = new FormData()
                  formData.append('file', blob, 'document.pdf')
                  console.log('FormData created', formData)

                  // Send to server
                  const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                  })

                  if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`)
                  }

                  const result = await response.json()
                  console.log('Upload successful:', result)

                  // Optionally show success message
                  alert('Document saved successfully!')
                } catch (error) {
                  console.error('Error saving document:', error)
                  alert('Failed to save document. Please try again.')
                }
              }
            },
            { type: 'content-editor' }
          ]
        })

        instanceRef.current = instance
      } catch (error) {
        console.error('Error loading PDF viewer:', error)
        alert('Failed to load PDF viewer. Please try again.')
      }
    })()

    return () => {
      if (instanceRef.current) {
        PSPDFKit && PSPDFKit.unload(container)
      }
    }
  }, [props.document])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      data-testid='pdf-viewer-container'
    />
  )
}
