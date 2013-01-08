var recent = angular.module('recent', []);

recent.service('recent', ['config','storage',function(config,storage) {
    var recent, maxSize = 50;
    storage.get('recent',function(object){
       recent = object.recent;
        if(!recent||!recent.songs||!recent.songs.length) recent = {title : "Recent", songs:[]};
    });

    var addSong = function(song){
       if(!validate(song))return;
       var check = checkSongInRecent(song);
        if(check){
           recent.songs.splice(check,1);
        }
        if (recent.songs.length >= maxSize){
            recent.songs.pop();
        }

        var newSong = angular.copy(song);
        newSong.lastPlayed = new Date().getTime();
        recent.songs.unshift(song);
        syncLocal();
    };

    var validate = function(song){
       return (song._id && song.youtubeId && song.thumbnail);
    };

    var checkSongInRecent = function(song){
       for (var i in recent.songs){
           if(recent.songs[i]._id == song._id && recent.songs[i].title == song.title)return i;
       }
       return false
    };

    var syncLocal = function(){
        storage.set({'recent' : recent});
    };

    return {
      syncLocal : syncLocal,
      get : function(){
          return recent;
      },
      addSong : addSong
    };
}]);

