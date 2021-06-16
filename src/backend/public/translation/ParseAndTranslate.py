# Provide the path to the file you want translated as a command line argument
import os
import sys
from html.parser import HTMLParser
import fitz
import requests as req
import json
import pdfkit
import config as conf
ar = {}
for lang in conf.LANGUAGES:
    ar[lang] = []

# Handles parsing, uses pymupdf

def to_html(filepath: str, book_id):
    doc = fitz.open(filepath)
    for i, page in enumerate(doc):
        text = page.getText("html")
        # with open(f"./public/translation/{book_id}/before_translation/{book_id}-page-{i}.html", "w") as fp:
        with open(f"./public/translation/{book_id}/{book_id}-page-{i}.html", "w") as fp:
            fp.write(text)
    doc.close()

# Handles the API call for translation. The access token needs to be manually updates as of now


def get_trans(text, init_lang, tar_lang):
    # This access token needs to be updated before use.
    # This token expires either every 2 weeks or every hour
    access_token = "eyJ4NXQiOiJNell4TW1Ga09HWXdNV0kwWldObU5EY3hOR1l3WW1NNFpUQTNNV0kyTkRBelpHUXpOR00wWkdSbE5qSmtPREZrWkRSaU9URmtNV0ZoTXpVMlpHVmxOZyIsImtpZCI6Ik16WXhNbUZrT0dZd01XSTBaV05tTkRjeE5HWXdZbU00WlRBM01XSTJOREF6WkdRek5HTTBaR1JsTmpKa09ERmtaRFJpT1RGa01XRmhNelUyWkdWbE5nX1JTMjU2IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZWFtMjNAY2FyYm9uLnN1cGVyIiwiYXVkIjoieEZSUkN2cjFNVnRGODJKR0dDXzk5bnFJY1ZjYSIsIm5iZiI6MTYxOTk4ODE0MSwiYXpwIjoieEZSUkN2cjFNVnRGODJKR0dDXzk5bnFJY1ZjYSIsInNjb3BlIjoiYW1fYXBwbGljYXRpb25fc2NvcGUgZGVmYXVsdCIsImlzcyI6Imh0dHBzOlwvXC9hcGltLmlpaXRoY2FudmFzLmNvbTo0NDNcL29hdXRoMlwvdG9rZW4iLCJleHAiOjE2MjEzMDU3NDEsImlhdCI6MTYxOTk4ODE0MSwianRpIjoiZTU0MjliNDktZDljYi00MWIyLTgxNGMtODhlNDA1OTJiMTdlIn0.RYtTqAjoGzobgyWpU3sfjfd1QcmiEem7KWEeSrcVy5Wp7FXdzmmOrRyizVhuTp0q-ZzygMpSQNjOD4c8BbYotRuhlI_ELNDhi5nhw-75eg-tGLmwXY2cx1TOePIIVWqRNJq31A5okxkpZHKCre_ruYYYfIbm0LdAuWDnkP3c8-MdFdSDho6q5pWnhjbzhzmozimJeoO-w7NW4YzGsQeHPVOnOngaeSe19hN5p23A5jq_g0h9bH_g8y-fjFyZeiwaEgqkDOjWdpu79NeFWbXRBj93gzXkmUvCD470K7V3heSoUgR3PDxMSU9RIun0UGKh43j4FEb91EDq5RwN3suIJw"
        # print("Text to be translated: #",text, "#")
    task = {
        "text": text,
        "source_language": init_lang,
        "target_language": tar_lang
    }
    # req = post_req(task)
    # resp = await req
    resp = req.post('https://apicallhttps.iiithcanvas.com/iiitilmt/v.1.0.0/mt_linker',
                    data=json.dumps(task),
                    headers={'Content-Type': 'application/json', 'Authorization': ("Bearer " + access_token)})
    # print(resp)
    ret = json.loads(resp.text)
    return ret["data"]

# Handles translating, and reconstructing the parsed html files.


class MyHTMLParser(HTMLParser):
    def __init__(self, output_file, input_lang, output_lang):
        super().__init__()
        self.output = output_file
        ar[output_lang].append(output_file)
        self.in_lang = input_lang
        self.out_lang = output_lang

    def handle_starttag(self, tag, attrs):
        to_write = "<" + tag
        for i in attrs:
            to_write += ' ' + i[0] + ' = "' + i[1] + '"'
        to_write += '>'
        with open(self.output, 'a') as f:
            f.write(to_write)

    def handle_endtag(self, tag):
        to_write = "</" + tag + ">"
        with open(self.output, 'a') as f:
            f.write(to_write)

    def handle_data(self, data):
        to_write = data
        if to_write != "\n":
            to_write = get_trans(to_write, self.in_lang, self.out_lang)
        with open(self.output, 'a') as f:
            f.write(to_write)

# Used to sort the translated filelist according to page number
def sort_filelist(filelist):
    lensorted = sorted(filelist, key=len)
    to_be_number_sorted = []
    temp = []
    prev_len = -1
    for i in lensorted:
        if len(i) != prev_len and prev_len != -1:
            to_be_number_sorted.append(temp)
            temp = []
        temp.append(i)
        prev_len = len(i)
    to_be_number_sorted.append(temp)

    for i, names in enumerate(to_be_number_sorted):
        to_be_number_sorted[i] = sorted(names)

    # print(to_be_number_sorted)
    final = []
    for i in to_be_number_sorted:
        for j in i:
            final.append(j)

    return final

# Handles translating and reconstructing all the html files in the read_directory


def translate(directory, trans_langs):
    filelist = []
    output_dict = {}
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filelist.append(filename)
    filelist = sort_filelist(filelist)
    output_dict["eng"] = filelist
    ar['eng'] = filelist
    for lang in trans_langs:
        output_list = []

        for _, filename in enumerate(filelist):
            # temp = filename.split('/')
            output_file = lang + "_" + filename
            temp_filename = os.path.join(directory+"/",filename)
            output_list.append(output_file)
            output_file = os.path.join(
                directory + "/", output_file)
            print("Translating:", filename)
            sys.stdout.flush()

            with open(output_file, "w") as f:
                f.write("<html><head><meta charset = 'utf-8'></head >")

            parser = MyHTMLParser(output_file, 'eng', lang)
            with open(temp_filename, 'r') as f:
                parser.feed(f.read())

            with open(output_file, "a") as f:
                f.write("</html>")

            print("Completed:", output_file)
            sys.stdout.flush()

        output_dict[lang] = sort_filelist(output_list)
    return output_dict


if __name__ == '__main__':
    try:
        pdf_path = sys.argv[1]
        book_id = sys.argv[2]
        trans_langs = sys.argv[3:]
        print("Pdf:", pdf_path, "Book ID:",
              book_id, "Trans_langs:", trans_langs)
    except:
        print("ERR: Please provide the correct arguments")
        print("Example: python3 ParseAndTranslate.py <pdf_to_be_translated> <book_id> <languages_to_translate_to>")
        sys.stdout.flush()
        quit()

    os.makedirs("./public/translation", exist_ok=True)
    os.makedirs("./public/translation/" + str(book_id), exist_ok=True)
    to_html(pdf_path, str(book_id))
    print("Parsing completed. Parsed files will be stored in './before_translation'.")
    print("Beginning Translation")
    sys.stdout.flush()

    translated_list = translate("./public/translation/" + str(book_id), trans_langs)  # Translates every html file in the target directory

    for lang in ar.keys():
        if lang == 'eng':
            for file in ar[lang]:
                os.system(('rm ./public/translation/' + str(book_id) + '/' + file))
        elif len(ar[lang]) > 0:
            pdfkit.from_file(ar[lang], './public/translation/' + str(book_id) + '/'+lang+'_' + str(book_id) + '.pdf')
            for file in ar[lang]:
                os.system(('rm ' + file))
    
    os.system(('rm ./public/pdf/' + str(book_id) + '.pdf'))
    # translated_list should contain a sorted list of the translated html files accrding to page number.
    # !!NOTE!! translated_list may not work for other file prefixes. It sorts using filename length as well as the name itself.
    # To ensure translated_list is sorted, make sure the filenames are of a similar format to: "before_translation/pymupdf-page-{i}.html"

    # translated_list will be useful when converting and combining the different html files into one pdf.
