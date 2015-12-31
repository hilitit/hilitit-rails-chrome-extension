DIR=~/works/hilitit/hilitit-rails-chrome-extension/app/images;
ls ${DIR} | grep Marker | grep 128 | while read file; do 
NAME=$(echo ${file}| sed 's|-[0-9]*.png||');
#echo ${NAME};
echo "resizing ${file} ...";
convert ${DIR}/${file} -resize 38x38 ${DIR}/${NAME}-38.png;
convert ${DIR}/${file} -resize 19x19  ${DIR}/${NAME}-19.png;
convert ${DIR}/${file} -resize 16x16  ${DIR}/${NAME}-16.png;
done
