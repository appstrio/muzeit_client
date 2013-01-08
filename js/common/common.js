/*
* CLASS : Song
*/
function Song(xml,id,name,youtubeId,length,url,thumbnail,duration,views) {
	if(xml) this.parseXML(xml);
	else{
		this._id			 = id||null;
		this.title			 = title;
		this.youtubeId		 = youtubeId;
		this.length			 = length;
		this.url			 = url;
		this.thumbnail		 = thumbnail;
        this.duration          = duration;
        this.views           = views;
	}
   /* return {
        title : this.title,
        youtubeId : this.youtubeId
    };*/
};


// parses youtube entry XML
Song.prototype.parseXML = function (xml){
	var media = $(xml).find('media\\:group').eq(0);
	var embedable = $(xml).find('yt\\:accesscontrol[action=embed]').eq(0).attr('permission');

	this.title			 = $(xml).find('title').text();
	this.youtubeId		 = media.find('yt\\:videoId').eq(0).text();
	//this.url			 = media.find('media\\:player').eq(0).attr('url');
	this.thumbnail		 = media.find('media\\:thumbnail').eq(0).attr('url');
    this.views =  $(xml).find('yt\\:statistics').eq(0).attr('viewCount');
    this.duration =  parseInt(media.find('media\\:content').eq(0).attr('duration'));
};


var genereateGUID = function ()
{
    var S4 = function ()
    {
        return Math.floor(
            Math.random() * 0x10000 /* 65536 */
        ).toString(16);
    };

    return (
        S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}