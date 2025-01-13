import { useEffect, useRef, useMemo } from 'react'
import PSPDFKit from 'pspdfkit'

const TOOLBAR_ICONS = {
  'zoom-in': '/icons/zoom-in.svg',
  'zoom-out': '/icons/zoom-out.svg',
  'multi-annotations-selection': '/icons/select.svg',
  pan: '/icons/pan.svg',
  'zoom-mode': '/icons/fit-page.svg',
  annotate: '/icons/annotation.svg',
  'document-editor': '/icons/edit-doc.svg',
  print: '/icons/print.svg',
  ink: '/icons/draw.svg',
  highlighter: '/icons/free-form-highlight.svg',
  'text-highlighter': '/icons/text-highlight.svg',
  'ink-eraser': '/icons/eraser.svg',
  image: '/icons/image.svg',
  link: '/icons/link.svg',
  note: '/icons/note.svg',
  text: '/icons/text.svg',
  'export-pdf': '/icons/download.svg',
  'document-crop': '/icons/document-crop.svg',
  search: '/icons/search.svg',
  'sidebar-thumbnails': '/icons/doc-thumbs.svg',
  'sidebar-bookmarks': '/icons/bookmark.svg',
  'sidebar-layers': '/icons/layers.svg',
  'sidebar-annotations': '/icons/annotation.svg'
}

export default function PdfViewerComponent (props) {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)

  const toolbarItems = useMemo(() => {
    const items = [...PSPDFKit.defaultToolbarItems]
    return items.map(item => ({
      ...item,
      icon: TOOLBAR_ICONS[item.type] || item.icon
    }))
  }, [])

  useEffect(() => {
    const container = containerRef.current

    ;(async function () {
      try {
        const instance = await PSPDFKit.load({
          container,
          document: props.document,
          baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
          styleSheets: ['/pdfViewerStyle.css'],
          toolbarItems: [
            ...toolbarItems,
            {
              type: 'custom',
              id: 'save',
              title: 'Save Document',
              icon: '/icons/save.svg',
              onPress: async () => {
                try {
                  const arrayBuffer = await instance.exportPDF()
                  const blob = new Blob([arrayBuffer], {
                    type: 'application/pdf'
                  })
                  const formData = new FormData()
                  formData.append('file', blob, 'document.pdf')
                  const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                  })

                  if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`)
                  }

                  const result = await response.json()
                  console.log('Upload successful:', result)
                  alert('Document saved successfully!')
                } catch (error) {
                  console.error('Error saving document:', error)
                  alert('Failed to save document. Please try again.')
                }
              }
            },
            { type: 'content-editor', icon: '/icons/content-edit.svg' }
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
        PSPDFKit.unload(container)
      }
    }
  }, [props.document, toolbarItems])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      data-testid='pdf-viewer-container'
    />
  )
}
