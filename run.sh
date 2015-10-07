#!/usr/bin/env bash

dir=$(dirname $0)

rm -rf $dir/graphics $dir/charts
mkdir $dir/graphics $dir/charts

# parse CSV -> JSON
node $dir/scripts/parse_data.js

echo 'Creating bar charts...'
node $dir/scripts/bars_viz.js
echo 'Creating bubble charts...'
node $dir/scripts/bubble_viz.js
echo 'Creating radar charts...'
node $dir/scripts/radar_data.js | python $dir/scripts/radar.py
echo  'Creating quartile charts..'
node $dir/scripts/quartile_viz.js

echo 'Converting to PNG...'

parallel --verbose --timeout 30 'node_modules/.bin/svgexport '$dir'/graphics/{} '$dir'/charts/`echo $(basename {}) | sed s/svg$/png/` 100% 4x' ::: $(ls $dir/graphics | grep '\.svg$');

cp $dir/graphics/*.png $dir/charts/;

rm -rf $dir/graphics

for image in $dir/charts/*; do
  donor=`echo $image | grep -o 'chart_.*\.png' | sed -e 's/chart_//' -e 's/\.png//'`;

  if [ ! -d $dir/donors/$donor ];
  then
    mkdir $dir/donors/$donor;
  fi

  if [ -e $dir/assets/maps/$donor'_map.png' ];
  then
    cp $dir/assets/maps/$donor'_map.png' $dir/donors/$donor/map.png
  else
    cp $dir/assets/images/placeholder.jpg $dir/donors/$donor/map.png
  fi

  if [ -e $dir'/charts/bar_chart_'$donor'.png' ];
  then
    cp $dir'/charts/bar_chart_'$donor'.png' $dir/donors/$donor/influence.png;
  else
    cp $dir/assets/images/placeholder.jpg $dir/donors/$donor/influence.png;
  fi

  if [ -e $dir'/charts/bubble_chart_'$donor'.png' ];
  then
    cp $dir'/charts/bubble_chart_'$donor'.png' $dir/donors/$donor/advice.png;
  else
    cp $dir/assets/images/placeholder.jpg $dir/donors/$donor/advice.png;
  fi

  if [ -e $dir'/charts/quartile_chart_'$donor'.png' ];
  then
    cp $dir'/charts/quartile_chart_'$donor'.png' $dir/donors/$donor/comp2.png;
  else
    cp $dir/assets/images/placeholder.jpg $dir/donors/$donor/comp2.png;
  fi

  if [ -e $dir'/charts/radar_chart_'$donor'.png' ];
  then
    cp $dir'/charts/radar_chart_'$donor'.png' $dir/donors/$donor/comp.png;
  else
    cp $dir/assets/images/placeholder.jpg $dir/donors/$donor/comp.png;
  fi

done

rm -rf $dir/charts

echo 'Creating PDFs...'
python $dir/donor_profile_gen.py
echo 'DONE!'
