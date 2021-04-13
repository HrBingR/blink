import { Fragment, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import pick from 'lodash/pick'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import SearchIcon from '@material-ui/icons/Search'
import FileCopyIcon from '@material-ui/icons/FileCopy'

export default function LinkShortener() {
  const [isOpen, setIsOpen] = useState(false)
  const [link, setLink] = useState({
    hash: '',
    originalUrl: '',
    shortenedUrl: '',
    brandedUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function shortenLink(e) {
    e.preventDefault()

    if (isLoading) return // wait until request is done
    setIsLoading(true)

    const linkBody = link.hash
      ? pick({ ...link }, ['originalUrl', 'hash'])
      : pick({ ...link }, ['originalUrl'])

    try {
      const result = await fetch('/api/links', {
        method: 'POST',
        body: JSON.stringify(linkBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!result.ok) throw new Error(await result.text())
      const { shortenedUrl, brandedUrl } = await result.json()

      setLink({ ...link, shortenedUrl, brandedUrl })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Fragment>
      <IconButton
        aria-label="add"
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        <AddIcon />
      </IconButton>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="form-dialog-title"
        fullWidth="60vw"
      >
        <DialogTitle id="form-dialog-title">Shorten Link</DialogTitle>

        <DialogContent>
          <form onSubmit={shortenLink}>
            <TextField
              autoFocus
              variant="filled"
              label="Paste link to shorten"
              placeholder="example.com"
              onChange={e => setLink({ ...link, originalUrl: e.target.value })}
              error={!!error}
              helperText={error}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="shorten"
                      color="secondary"
                      disabled={isLoading} // TODO: json schema check originalUrl
                      type="submit"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              variant="filled"
              label="Custom URL"
              placeholder={
                link.shortenedUrl
                  ? link.shortenedUrl.split('/').pop()
                  : 'awesome-link'
              }
              onChange={e => setLink({ ...link, hash: e.target.value })}
              error={!!error}
              disabled={isLoading || link.brandedUrl} // TODO: disable when you can't change
              style={{ marginTop: '2rem', paddingBottom: '1rem' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    style={{ marginRight: 0, marginBottom: '-3px' }}
                  >
                    {process.env.REACT_APP_BASE_URL}/
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard
                      text={link.brandedUrl || link.shortenedUrl}
                    >
                      <IconButton
                        aria-label="copy link"
                        color="secondary"
                        disabled={isLoading || !link.shortenedUrl}
                      >
                        <FileCopyIcon />
                      </IconButton>
                    </CopyToClipboard>
                  </InputAdornment>
                )
              }}
            />
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
