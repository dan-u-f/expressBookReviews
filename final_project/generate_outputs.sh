#!/bin/bash
# Genera los archivos de salida que pide la tarea.
# Uso: bash generate_outputs.sh TU_USUARIO_DE_GITHUB
# (el servidor debe estar corriendo en otra terminal con: node index.js)

GH_USER=${1:-dan-u-f}
BASE=http://localhost:5000
JSON_H='Content-Type: application/json'

show() {
  local file=$1
  local cmd=$2
  { echo "\$ $cmd"; eval "$cmd"; echo; } 2>&1 | tee "$file"
  echo "-------- ($file guardado) --------"
}

rm -f cookies.txt

show githubrepo     "curl -s https://api.github.com/repos/$GH_USER/expressBookReviews | grep -E '\"full_name\"|\"fork\"|\"parent\"|\"source\"'"
show getallbooks    "curl -s $BASE/"
show getbooksbyISBN "curl -s $BASE/isbn/1"
show getbooksbyauthor "curl -s $BASE/author/Jane%20Austen"
show getbooksbytitle  "curl -s $BASE/title/Things%20Fall%20Apart"
show getbookreview  "curl -s $BASE/review/1"
show register       "curl -s -X POST $BASE/register -H '$JSON_H' -d '{\"username\":\"dan\",\"password\":\"1234\"}'"
show login          "curl -s -c cookies.txt -X POST $BASE/customer/login -H '$JSON_H' -d '{\"username\":\"dan\",\"password\":\"1234\"}'"
show reviewadded    "curl -s -b cookies.txt -X PUT '$BASE/customer/auth/review/1?review=Excelente%20libro'"
show deletereview   "curl -s -b cookies.txt -X DELETE $BASE/customer/auth/review/1"
