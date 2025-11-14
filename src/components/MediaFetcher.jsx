import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TIMING, DEFAULTS, API_ENDPOINTS, MEDIA_TYPES, URL_CONFIG } from '../constants/constants.js'
import '../styles/MediaFetcher.css'

const MediaFetcher = () => {
  const [lastMediaUrls, setLastMediaUrls] = useState([])
  const [lastVideoIdsToUpscale, setLastVideoIdsToUpscale] = useState([])
  const [lastHdVideoCount, setLastHdVideoCount] = useState(0)
  const [upscaleTotal, setUpscaleTotal] = useState(0)
  const [upscaleDone, setUpscaleDone] = useState(0)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [status, setStatus] = useState(DEFAULTS.STATUS_READY)
  const [showDetails, setShowDetails] = useState(false)
  const lastKnownPostIdRef = useRef(null)

  const upscaleRefetchTimeoutRef = useRef(null)
  const upscaleTimeoutIdsRef = useRef([])
  const urlWatcherIntervalRef = useRef(null)

  const getPostIdFromUrl = useCallback(() => {
    const parts = window.location.pathname.split('/').filter(Boolean)
    return parts[URL_CONFIG.POST_ID_INDEX] || null
  }, [])

  const fetchPostData = useCallback(async (postId) => {
    const res = await fetch(API_ENDPOINTS.POST_GET, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: postId }),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    return res.json()
  }, [])

  const upscaleVideo = useCallback(async (videoId) => {
    const res = await fetch(API_ENDPOINTS.VIDEO_UPSCALE, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    })

    if (!res.ok) {
      throw new Error(`Upscale HTTP ${res.status}`)
    }

    const json = await res.json().catch(() => null)
    console.log('[Grok Media Fetcher] Upscale response for', videoId, json)
    return json
  }, [])

  const fallbackDownload = useCallback((url, name) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  const triggerDownloads = useCallback((urls) => {
    const canUseGmDownload = typeof GM_download === 'function'
    urls.forEach((url, idx) => {
      setTimeout(() => {
        const clean = url.split('?')[0]
        const name = clean.split('/').filter(Boolean).pop() || `${DEFAULTS.MEDIA_FILENAME_PREFIX}${idx + 1}`
        if (canUseGmDownload) {
          try {
            GM_download({
              url,
              name,
              saveAs: false,
              onerror: (err) => {
                console.error('[Grok Media Fetcher] GM_download error, fallback triggered:', err)
                fallbackDownload(url, name)
              },
            })
          } catch (err) {
            console.error('[Grok Media Fetcher] GM_download threw, fallback triggered:', err)
            fallbackDownload(url, name)
          }
        } else {
          fallbackDownload(url, name)
        }
      }, idx * TIMING.DOWNLOAD_DELAY)
    })
  }, [fallbackDownload])

  const fetchAndRender = useCallback(async () => {
    const postId = getPostIdFromUrl()
    if (!postId) {
      setStatus('❌ Could not detect post ID')
      return
    }

    try {
      const json = await fetchPostData(postId)
      window.grokPostData = json
      console.log('[Grok Media Fetcher] Response:', json)

      const post = json.post || {}
      setStatus('✅ Fetched @ ' + new Date().toLocaleTimeString())

      const urls = []
      const videosNeedingUpscale = []
      let hdVideoCount = 0

      const pickDownloadUrl = (obj) =>
        obj && (obj.hdMediaUrl || obj.mediaUrl || obj.thumbnailImageUrl || null)

      if (Array.isArray(post.childPosts) && post.childPosts.length > 0) {
        post.childPosts.forEach((cp) => {
          const url = pickDownloadUrl(cp)
          if (url) {
            urls.push(url)
          }

          if (cp.mediaType === MEDIA_TYPES.VIDEO) {
            const isHd = !!cp.hdMediaUrl
            if (isHd) {
              hdVideoCount += 1
            } else if (cp.id) {
              videosNeedingUpscale.push(cp.id)
            }
          }
        })
      }

      setLastMediaUrls(Array.from(new Set(urls)))
      setLastVideoIdsToUpscale(Array.from(new Set(videosNeedingUpscale)))
      setLastHdVideoCount(hdVideoCount)

      if (!isUpscaling) {
        setUpscaleTotal(videosNeedingUpscale.length)
        setUpscaleDone(0)
      }
    } catch (err) {
      console.error('[Grok Media Fetcher] Error:', err)
      setStatus('❌ Error (see console)')
    }
  }, [getPostIdFromUrl, fetchPostData, isUpscaling])

  const startUpscaleRefetchLoop = useCallback(() => {
    if (upscaleRefetchTimeoutRef.current) return

    const tick = async () => {
      if (!isUpscaling || upscaleDone >= upscaleTotal) {
        upscaleRefetchTimeoutRef.current = null
        return
      }

      try {
        await fetchAndRender()
      } catch (e) {
        console.error('[Grok Media Fetcher] Upscale-refetch error:', e)
      }

      const delay = TIMING.UPSCALE_REFETCH_MIN + Math.random() * (TIMING.UPSCALE_REFETCH_MAX - TIMING.UPSCALE_REFETCH_MIN)
      upscaleRefetchTimeoutRef.current = setTimeout(tick, delay)
    }

    tick()
  }, [isUpscaling, upscaleDone, upscaleTotal, fetchAndRender])

  const handleFetchClick = useCallback(async () => {
    await fetchAndRender()
    setShowDetails(true)
  }, [fetchAndRender])

  const handleDownloadClick = useCallback(() => {
    setShowDetails(true)

    if (!lastMediaUrls || lastMediaUrls.length === 0) {
      setStatus('⚠️ Nothing to download – press Fetch first')
      return
    }

    setStatus(`⬇ Downloading ${lastMediaUrls.length} item(s)...`)
    triggerDownloads(lastMediaUrls)
  }, [lastMediaUrls, triggerDownloads])

  const handleUpscaleClick = useCallback(async () => {
    setShowDetails(true)

    if (isUpscaling) {
      setStatus('⏳ Already upscaling...')
      return
    }

    await fetchAndRender()

    if (!lastVideoIdsToUpscale || lastVideoIdsToUpscale.length === 0) {
      setStatus('⚠️ No videos to upscale (either none or already HD)')
      return
    }

    setIsUpscaling(true)
    setUpscaleTotal(lastVideoIdsToUpscale.length)
    setUpscaleDone(0)
    setStatus('🚀 Upscaling started...')

    startUpscaleRefetchLoop()

    upscaleTimeoutIdsRef.current = []
    // Capture the array and length to avoid race condition with refetch loop
    const videosToUpscale = [...lastVideoIdsToUpscale]
    const totalVideos = videosToUpscale.length
    let accumulatedDelay = 0
    videosToUpscale.forEach((videoId, idx) => {
      const delay = TIMING.UPSCALE_DELAY_MIN + Math.random() * (TIMING.UPSCALE_DELAY_MAX - TIMING.UPSCALE_DELAY_MIN)
      accumulatedDelay += delay

      const timeoutId = setTimeout(async () => {
        try {
          await upscaleVideo(videoId)
          setUpscaleDone((prev) => prev + 1)
        } catch (e) {
          console.error('[Grok Media Fetcher] Upscale error for', videoId, e)
        }

        // Use captured length instead of state variable to avoid race condition
        if (idx === totalVideos - 1) {
          setIsUpscaling(false)
          setStatus('✅ Upscale batch finished')
        }
      }, accumulatedDelay)

      upscaleTimeoutIdsRef.current.push(timeoutId)
    })
  }, [isUpscaling, lastVideoIdsToUpscale, fetchAndRender, startUpscaleRefetchLoop, upscaleVideo])

  const handleMoreClick = useCallback(() => {
    setShowDetails((prev) => !prev)
  }, [])

  const resetStateForNewPost = useCallback((newPostId) => {
    setLastMediaUrls([])
    setLastVideoIdsToUpscale([])
    setLastHdVideoCount(0)
    setUpscaleTotal(0)
    setUpscaleDone(0)
    setIsUpscaling(false)

    if (upscaleRefetchTimeoutRef.current) {
      clearTimeout(upscaleRefetchTimeoutRef.current)
      upscaleRefetchTimeoutRef.current = null
    }

    while (upscaleTimeoutIdsRef.current.length) {
      const timeoutId = upscaleTimeoutIdsRef.current.pop()
      clearTimeout(timeoutId)
    }

    setShowDetails(false)
    setUpscaleTotal(0)
    setUpscaleDone(0)

    if (newPostId) {
      setStatus(DEFAULTS.STATUS_READY)
    } else {
      setStatus(DEFAULTS.STATUS_WAITING)
    }
  }, [])

  useEffect(() => {
    const currentPostId = getPostIdFromUrl()
    lastKnownPostIdRef.current = currentPostId
    resetStateForNewPost(currentPostId)

    urlWatcherIntervalRef.current = setInterval(() => {
      const current = getPostIdFromUrl()
      if (current !== lastKnownPostIdRef.current) {
        lastKnownPostIdRef.current = current
        resetStateForNewPost(current)
      }
    }, TIMING.URL_WATCHER_INTERVAL)

    return () => {
      if (urlWatcherIntervalRef.current) {
        clearInterval(urlWatcherIntervalRef.current)
      }
      if (upscaleRefetchTimeoutRef.current) {
        clearTimeout(upscaleRefetchTimeoutRef.current)
      }
      upscaleTimeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [getPostIdFromUrl, resetStateForNewPost])

  const totalVideoCount = lastVideoIdsToUpscale.length + lastHdVideoCount

  return (
    <div className="media-fetcher-container">
      <div className="media-fetcher-pill">
        <button className="icon-button fetch-btn" onClick={handleFetchClick}>
          Fetch
        </button>
        <button className="icon-button" onClick={handleUpscaleClick}>
          Upscale
        </button>
        <button className="icon-button" onClick={handleDownloadClick}>
          Download
        </button>
        <button className="icon-button more-btn" onClick={handleMoreClick}>
          ⋯
        </button>
      </div>

      {showDetails && (
        <div className="media-fetcher-details">
          <div className="status">{status}</div>
          <div className="upscale-info">
            Upscaled {upscaleDone} / {upscaleTotal} (HD {lastHdVideoCount})
          </div>
          {lastMediaUrls.length > 0 && (
            <div className="links-info">
              Media: {lastMediaUrls.length} | Videos: {totalVideoCount} (HD{' '}
              {lastHdVideoCount}, {lastVideoIdsToUpscale.length} to upscale)
            </div>
          )}
          {lastMediaUrls.length === 0 && (
            <div className="links-info">No media URLs detected</div>
          )}
        </div>
      )}
    </div>
  )
}

export default MediaFetcher

