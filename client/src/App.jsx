import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'

function App() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')

  const shortenUrl = async (url) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_GW_URL}/shorten`,
      { url }
    )
    return response.data
  }

  const handleChange = (e) => {
    setUrl(e.target.value)
  }

  const mutation = useMutation({
    mutationFn: shortenUrl,
    onSuccess: (data) => {
      console.log('Success:', data)
      setShortUrl(data.shortUrl)
    },
    onError: (error) => {
      console.log('Error:', error)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    mutation.mutate(url)
  }
  return (
    <div className='container'>
      <header>
        <h1 className='title'>URL SHORTENER</h1>
      </header>
      <div>
        <main>
          <h1>Paste the URL to be shortened</h1>
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              placeholder='Enter the link here'
              onChange={handleChange}
              value={url}
              disabled={mutation.isPending}
            />
            <input
              type='submit'
              value={mutation.isPending ? 'Shortening...' : 'Shorten URL'}
              disabled={mutation.isPending}
              className={mutation.isPending ? 'loading' : ''}
            />
          </form>

          {mutation.isError && (
            <div className='error-message'>
              Failed to shorten URL. Please try again
            </div>
          )}

          {shortUrl && (
            <div className='result-container'>
              <h2>Your shortened URL:</h2>
              <div className='url-display'>
                <a href='{shortUrl}' target='_blank' rel='noopener noreferrer'>
                  {shortUrl}
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(shortUrl)}
                  className='copy-button'
                >
                  Copy
                </button>
              </div>
            </div>
          )}
          <p>
            ShortURL is a free tool to shorten URLs and generate short links URL
            shortener allows to create a shortened link making it easy to share
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
