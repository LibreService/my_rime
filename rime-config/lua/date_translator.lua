local function translator(input, seg)
  if (input == "date") then
    yield(Candidate("date", seg.start, seg._end, os.date("%Y年%m月%d日"), " 日期"))
  end
end

return translator
