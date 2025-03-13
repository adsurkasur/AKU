import os

# List of files to be dumped
files_to_dump = [
    "index.html",
    "script.js",
    "styles.css"
]

# Output file
output_file = "dumped_code.txt"

# Clear the output file before dumping new codes
with open(output_file, "w", encoding="utf-8") as outfile:
    outfile.write("")

with open(output_file, "a", encoding="utf-8") as outfile:
    for filepath in files_to_dump:
        outfile.write(f"// {os.path.basename(filepath)}\n")
        with open(filepath, "r", encoding="utf-8") as infile:
            outfile.write(infile.read())
        outfile.write("\n\n")

print(f"Code dumped into {output_file}")