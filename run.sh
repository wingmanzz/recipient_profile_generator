#!/usr/bin/env bash

dir=$(dirname $0)

rm -rf $dir/graphics $dir/charts
mkdir $dir/graphics $dir/charts

for script in $dir/scripts/*_viz.js; do
    node $script;
done

parallel --verbose --timeout 30 \
    'node_modules/.bin/svgexport '$dir'/graphics/{} '$dir'/charts/`echo $(basename {}) \
    | sed s/svg$/png/` 100% 4x' ::: $(ls $dir/graphics);

python $dir/recipient_profile_gen.py
