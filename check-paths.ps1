$files = Get-ChildItem 'D:\web-toolkit-副本一\新建文件夹' -Recurse -File
$max = $files | Sort-Object { $_.FullName.Length } -Descending | Select-Object -First 5
foreach ($f in $max) {
    Write-Output "$($f.FullName.Length) chars"
    Write-Output $f.FullName
    Write-Output "---"
}
Write-Output "Total files: $($files.Count)"
