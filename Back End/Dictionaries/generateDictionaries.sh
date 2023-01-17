#!/bin/sh

# Generate alphabetic, no capitalisation or special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-z' | fold -w $((($i % 8) + 3))| head -n 1) >> ./Alphabetic_c_n;
  echo $i;
done

# Generate alphabetic, no capitalisation yes special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-z!-*' | fold -w $((($i % 8) + 3))| head -n 1) >> ./Alphabetic_c_y;
  echo $i;
done

# Generate alphabetic, yes capitalisation no special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-zA-Z' | fold -w $((($i % 8) + 3))| head -n 1) >> ./Alphabetic_C_n;
  echo $i;
done

# Generate alphabetic, yes capitalisation yes special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-zA-Z!-*' | fold -w $((($i % 8) + 3))| head -n 1) >> ./Alphabetic_C_y;
  echo $i;
done

# Generate alphanumeric, no capitalisation or special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-z0-9' | fold -w $((($i % 8) + 3))| head -n 1) >> ./alphanumeric_c_n;
  echo $i;
done

# Generate alphanumeric, no capitalisation yes special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-z!-*0-9' | fold -w $((($i % 8) + 3))| head -n 1) >> ./alphanumeric_c_y;
  echo $i;
done

# Generate alphanumeric, yes capitalisation no special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $((($i % 8) + 3))| head -n 1) >> ./alphanumeric_C_n;
  echo $i;
done

# Generate alphanumeric, yes capitalisation yes special chars
for i in {0..8000}
do
  (cat /dev/urandom | tr -dc 'a-zA-Z!-*0-9' | fold -w $((($i % 8) + 3))| head -n 1) >> ./alphanumeric_C_y;
  echo $i;
done
