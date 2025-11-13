/**
 * Media processing functions
 */

import { Utils } from '../lib/utils.js';
import { MEDIA_TYPES } from '../constants/constants.js';

export const MediaProcessor = {
    /**
     * Process post data and extract media information
     * @param {Object} post - Post data object
     * @returns {Object} Processed media data
     */
    processPostData(post) {
        const urls = [];
        const videosNeedingUpscale = [];
        let hdVideoCount = 0;

        if (Array.isArray(post.childPosts) && post.childPosts.length > 0) {
            post.childPosts.forEach((cp) => {
                const url = Utils.pickDownloadUrl(cp);
                if (url) {
                    urls.push(url);
                }

                if (cp.mediaType === MEDIA_TYPES.VIDEO) {
                    const isHd = !!cp.hdMediaUrl;
                    if (isHd) {
                        hdVideoCount += 1;
                    } else if (cp.id) {
                        videosNeedingUpscale.push(cp.id);
                    }
                }
            });
        }

        return {
            urls: Array.from(new Set(urls)),
            videosToUpscale: Array.from(new Set(videosNeedingUpscale)),
            hdVideoCount,
        };
    }
};

